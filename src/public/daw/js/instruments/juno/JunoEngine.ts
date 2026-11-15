import { JunoPatch, defaultPatch } from './JunoPatch';

/**
 * Juno-106-style polysynth DSP, sample by sample, with no Web Audio dependency.
 *
 * The same class runs inside the AudioWorklet (juno.worklet.ts) for live
 * playback and directly under Jest for offline rendering, which is what lets
 * JunoReference.test.ts compare its output against a reference renderer.
 *
 * Signal flow, following the hardware:
 *
 *   per voice ×6:  DCO (saw + pulse + sub + noise) → 4-pole ladder VCF → VCA
 *   global:        Σ voices → 4-position HPF → BBD-style stereo chorus
 *
 * Every slider-to-physical-unit law lives in `JUNO_CALIBRATION`, so fitting
 * the engine to a reference is a matter of changing numbers there.
 */

const C1_HZ = 32.703;

/** Slider (0–127) to physical-unit laws. Fitted by measurement; see tools/juno-reference. */
export const JUNO_CALIBRATION = {
    /** VCF cutoff at slider 0 and 127, Hz, exponential in between. */
    vcfMinHz: 5,
    vcfMaxHz: 25000,
    /** Octaves of cutoff sweep at full envelope amount and envelope = 1. */
    vcfEnvOctaves: 10,
    /** Octaves of cutoff sweep at full VCF LFO amount. */
    vcfLfoOctaves: 3,
    /** Ladder feedback at full resonance (4 is the linear self-oscillation point). */
    resonanceMax: 4.6,
    /** Pitch modulation at full DCO LFO amount, semitones peak. */
    dcoLfoSemitones: 3,
    /** Pulse duty range across the PWM slider. */
    pwmMinDuty: 0.5,
    pwmMaxDuty: 0.95,
    /** The Juno-106 firmware scales the PWM byte against 105, not 127. */
    pwmFullScale: 105,
    /** LFO rate range, Hz. */
    lfoMinHz: 0.1,
    lfoMaxHz: 30,
    /** LFO fade-in time at full delay, seconds. */
    lfoDelayMaxSec: 1.5,
    /** Envelope time ranges, seconds (attack: linear ramp; decay/release: to −60 dB). */
    attackMinSec: 0.0015,
    attackMaxSec: 3,
    decayMinSec: 0.0015,
    decayMaxSec: 12,
    releaseMinSec: 0.0015,
    releaseMaxSec: 12,
    /** Mixer gains. */
    sawGain: 0.5,
    pulseGain: 0.5,
    subGain: 0.67,
    noiseGain: 0.5,
    /** HPF corners. */
    hpfBoostHz: 150,
    hpfBoostDb: 10,
    hpf2Hz: 240,
    hpf3Hz: 720,
    /** Chorus: centre delay, per-mode rate and depth, BBD bandwidth. */
    chorusCentreMs: 3.5,
    chorus1Hz: 0.513,
    chorus1DepthMs: 1.6,
    chorus2Hz: 0.863,
    chorus2DepthMs: 1.6,
    chorusLowpassHz: 14000,
    chorusDry: 0.4,
    chorusWet: 0.6,
};

export type JunoCalibration = typeof JUNO_CALIBRATION;

const expMap = (x: number, lo: number, hi: number) => lo * Math.pow(hi / lo, x);
const norm = (v: number) => Math.max(0, Math.min(127, v)) / 127;

/** Padé tanh: accurate to the ladder's operating range and cheap. */
function softClip(x: number): number {
    if (x > 3) return 1;
    if (x < -3) return -1;
    const x2 = x * x;
    return (x * (27 + x2)) / (27 + 9 * x2);
}

/** PolyBLEP residual for a unit step at phase 0, phase in [0,1), increment dt. */
function polyBlep(t: number, dt: number): number {
    if (t < dt) {
        const x = t / dt;
        return x + x - x * x - 1;
    }
    if (t > 1 - dt) {
        const x = (t - 1) / dt;
        return x * x + x + x + 1;
    }
    return 0;
}

/** One-pole TPT lowpass; `highpass` gives x − lowpass. */
class OnePole {
    private s = 0;
    private G = 0;
    setCutoff(hz: number, sr: number) {
        const g = Math.tan((Math.PI * Math.min(hz, sr * 0.49)) / sr);
        this.G = g / (1 + g);
    }
    lowpass(x: number): number {
        const v = (x - this.s) * this.G;
        const y = v + this.s;
        this.s = y + v;
        return y;
    }
    reset() {
        this.s = 0;
    }
}

interface Derived {
    octaveShift: number;
    sawOn: number;
    pulseOn: number;
    subLevel: number;
    noiseLevel: number;
    pwm: number;
    pwmManual: boolean;
    cutoffBaseOct: number;
    kbd: number;
    envOct: number;
    lfoOct: number;
    resonance: number;
    dcoLfoSemis: number;
    vcaGain: number;
    vcaGate: boolean;
    attackInc: number;
    decayMul: number;
    sustain: number;
    releaseMul: number;
    lfoInc: number;
    lfoDelaySec: number;
}

const enum Stage {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

class Voice {
    note = -1;
    gate = false;
    stage = Stage.Idle;
    env = 0;
    gateEnv = 0;
    phase = 0;
    subPhase = 0;
    private s = [0, 0, 0, 0];
    private noiseState: number;
    private noiseLp = 0;
    age = 0;

    constructor(seed: number) {
        this.noiseState = (seed * 2654435761) >>> 0 || 1;
    }

    get active() {
        return this.stage !== Stage.Idle;
    }

    trigger(note: number) {
        this.note = note;
        this.gate = true;
        this.stage = Stage.Attack;
        if (this.env === 0) {
            this.phase = 0;
            this.subPhase = 0;
        }
    }

    release() {
        this.gate = false;
        if (this.stage !== Stage.Idle) this.stage = Stage.Release;
    }

    private noise(): number {
        // xorshift32: deterministic per voice, so offline renders repeat exactly.
        let x = this.noiseState;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.noiseState = x >>> 0;
        const white = (this.noiseState / 4294967296) * 2 - 1;
        this.noiseLp += (white - this.noiseLp) * 0.7;
        return this.noiseLp;
    }

    private thermalState = 0x9e3779b9;
    private thermal(): number {
        let x = this.thermalState;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.thermalState = x >>> 0;
        return (this.thermalState / 4294967296) * 2 - 1;
    }

    private stepEnvelope(d: Derived) {
        switch (this.stage) {
            case Stage.Attack:
                this.env += d.attackInc;
                if (this.env >= 1) {
                    this.env = 1;
                    this.stage = Stage.Decay;
                }
                break;
            case Stage.Decay:
                this.env *= d.decayMul;
                if (this.env <= d.sustain) {
                    this.env = d.sustain;
                    this.stage = Stage.Sustain;
                }
                break;
            case Stage.Sustain:
                this.env += (d.sustain - this.env) * 0.001;
                break;
            case Stage.Release:
                this.env *= d.releaseMul;
                break;
        }
        const gateTarget = this.gate ? 1 : 0;
        this.gateEnv += Math.sign(gateTarget - this.gateEnv) * Math.min(1 / 32, Math.abs(gateTarget - this.gateEnv));
        const level = d.vcaGate ? this.gateEnv : this.env;
        if (!this.gate && level < 1e-5) {
            this.stage = Stage.Idle;
            this.env = 0;
            this.gateEnv = 0;
            this.s.fill(0);
        }
    }

    /** One output sample. `lfo` is the shared LFO value in [−1, 1]. */
    tick(d: Derived, lfo: number, sr: number): number {
        this.stepEnvelope(d);
        if (this.stage === Stage.Idle) return 0;

        // DCO
        const semis = this.note + d.octaveShift - 69 + lfo * d.dcoLfoSemis;
        const freq = 440 * Math.pow(2, semis / 12);
        const dt = Math.min(freq / sr, 0.5);
        this.phase += dt;
        if (this.phase >= 1) this.phase -= 1;
        this.subPhase += dt * 0.5;
        if (this.subPhase >= 1) this.subPhase -= 1;

        let mix = 0;
        if (d.sawOn) {
            const saw = 2 * this.phase - 1 - polyBlep(this.phase, dt);
            mix += saw * d.sawOn;
        }
        if (d.pulseOn) {
            const width = d.pwmManual ? d.pwm : d.pwm * (lfo + 1) * 0.5;
            const duty =
                JUNO_CALIBRATION.pwmMinDuty + (JUNO_CALIBRATION.pwmMaxDuty - JUNO_CALIBRATION.pwmMinDuty) * width;
            let pulse = this.phase < duty ? 1 : -1;
            pulse += polyBlep(this.phase, dt);
            let t2 = this.phase - duty;
            if (t2 < 0) t2 += 1;
            pulse -= polyBlep(t2, dt);
            mix += pulse * d.pulseOn;
        }
        if (d.subLevel) {
            const sdt = dt * 0.5;
            let sub = this.subPhase < 0.5 ? 1 : -1;
            sub += polyBlep(this.subPhase, sdt);
            let t2 = this.subPhase - 0.5;
            if (t2 < 0) t2 += 1;
            sub -= polyBlep(t2, sdt);
            mix += sub * d.subLevel;
        }
        if (d.noiseLevel) mix += this.noise() * d.noiseLevel;

        // VCF: 4 one-pole TPT stages with saturating feedback, 2× oversampled.
        const envLevel = this.env;
        const cutoffOct = d.cutoffBaseOct + d.kbd * Math.log2(freq / C1_HZ) + d.envOct * envLevel + d.lfoOct * lfo;
        const fs2 = sr * 2;
        const fc = Math.max(20, Math.min(Math.pow(2, cutoffOct), 0.41 * fs2));
        const g = Math.tan((Math.PI * fc) / fs2);
        const G = g / (1 + g);
        const nyqTaper = fc / fs2 > 0.35 ? Math.max(0.25, 1 - (fc / fs2 - 0.35) * 6) : 1;
        const k = d.resonance * nyqTaper;
        const comp = 1 + (k / 4) * (k / 4) * 0.5;
        const s = this.s;
        let y = 0;
        for (let os = 0; os < 2; os++) {
            const G2 = G * G;
            // Linear TPT cascade: y4 = G⁴·u + S, with S from the four stage states.
            const S = (1 - G) * (G2 * G * s[0] + G2 * s[1] + G * s[2] + s[3]);
            const G4 = G2 * G2;
            // A tiny noise floor, as in the analog circuit: without it a digital
            // ladder at full resonance with no input never starts oscillating.
            const thermal = this.thermal() * 1e-4;
            let u = ((mix + thermal) * comp - k * S) / (1 + k * G4);
            u = softClip(u);
            let x = u;
            for (let i = 0; i < 4; i++) {
                const v = (x - s[i]) * G;
                const out = v + s[i];
                s[i] = out + v;
                x = out;
            }
            y += x;
        }
        y *= 0.5;

        const level = d.vcaGate ? this.gateEnv : envLevel;
        return y * level * d.vcaGain;
    }
}

export class JunoEngine {
    readonly sampleRate: number;
    private patch: JunoPatch = { ...defaultPatch };
    private d!: Derived;
    private voices: Voice[];
    private clock = 0;

    // LFO
    private lfoPhase = 0;
    private lfoFade = 0;
    private lfoFadeInc = 1;

    // HPF
    private hpfLp = new OnePole();

    // Chorus
    private delayL: Float32Array;
    private delayR: Float32Array;
    private writeIndex = 0;
    private chorusPhase = 0;
    private chorusLpL = new OnePole();
    private chorusLpR = new OnePole();

    constructor(sampleRate: number, patch: JunoPatch = defaultPatch, polyphony = 6) {
        this.sampleRate = sampleRate;
        this.voices = Array.from({ length: polyphony }, (_, i) => new Voice(i + 1));
        const delaySamples = Math.ceil(sampleRate * 0.02) + 4;
        this.delayL = new Float32Array(delaySamples);
        this.delayR = new Float32Array(delaySamples);
        this.chorusLpL.setCutoff(JUNO_CALIBRATION.chorusLowpassHz, sampleRate);
        this.chorusLpR.setCutoff(JUNO_CALIBRATION.chorusLowpassHz, sampleRate);
        this.setPatch(patch);
    }

    getPatch(): JunoPatch {
        return { ...this.patch };
    }

    setPatch(patch: JunoPatch) {
        this.patch = { ...patch };
        const c = JUNO_CALIBRATION;
        const sr = this.sampleRate;
        const p = this.patch;
        const t60 = (sec: number) => Math.exp(Math.log(1e-3) / (sec * sr));
        this.d = {
            octaveShift: [-12, 0, 12][p.octave],
            sawOn: p.saw ? c.sawGain : 0,
            pulseOn: p.pulse ? c.pulseGain : 0,
            subLevel: norm(p.dcoSub) * c.subGain,
            noiseLevel: norm(p.dcoNoise) * c.noiseGain,
            pwm: Math.min(p.dcoPwm, c.pwmFullScale) / c.pwmFullScale,
            pwmManual: p.pwmManual,
            cutoffBaseOct: Math.log2(expMap(norm(p.vcfFreq), c.vcfMinHz, c.vcfMaxHz)),
            kbd: norm(p.vcfKbd),
            envOct: norm(p.vcfEnv) * c.vcfEnvOctaves * (p.vcfEnvInvert ? -1 : 1),
            lfoOct: norm(p.vcfLfo) * c.vcfLfoOctaves,
            resonance: norm(p.vcfRes) * c.resonanceMax,
            dcoLfoSemis: norm(p.dcoLfo) * c.dcoLfoSemitones,
            vcaGain: Math.pow(10, ((norm(p.vcaLevel) - 0.5) * 20) / 20),
            vcaGate: p.vcaGate,
            attackInc: 1 / (expMap(norm(p.envA), c.attackMinSec, c.attackMaxSec) * sr),
            decayMul: t60(expMap(norm(p.envD), c.decayMinSec, c.decayMaxSec)),
            sustain: norm(p.envS),
            releaseMul: t60(expMap(norm(p.envR), c.releaseMinSec, c.releaseMaxSec)),
            lfoInc: expMap(norm(p.lfoRate), c.lfoMinHz, c.lfoMaxHz) / sr,
            lfoDelaySec: norm(p.lfoDelay) * c.lfoDelayMaxSec,
        };
        this.lfoFadeInc = this.d.lfoDelaySec > 0 ? 1 / (this.d.lfoDelaySec * sr) : 1;
        this.hpfLp.setCutoff(p.hpf === 0 ? c.hpfBoostHz : p.hpf === 2 ? c.hpf2Hz : p.hpf === 3 ? c.hpf3Hz : 1000, sr);
    }

    noteOn(note: number) {
        if (!this.voices.some((v) => v.gate)) {
            // Auto LFO delay: the fade restarts when playing starts from silence.
            this.lfoFade = this.d.lfoDelaySec > 0 ? 0 : 1;
        }
        const retrigger = this.voices.find((v) => v.note === note && v.active);
        const free = this.voices.filter((v) => !v.active).sort((a, b) => a.age - b.age)[0];
        const released = this.voices.filter((v) => !v.gate).sort((a, b) => a.age - b.age)[0];
        const oldest = [...this.voices].sort((a, b) => a.age - b.age)[0];
        const voice = retrigger ?? free ?? released ?? oldest;
        voice.age = ++this.clock;
        voice.trigger(note);
    }

    noteOff(note: number) {
        for (const v of this.voices) if (v.note === note && v.gate) v.release();
    }

    allNotesOff() {
        for (const v of this.voices) v.release();
    }

    get activeVoices(): number {
        return this.voices.filter((v) => v.active).length;
    }

    private lfoTick(): number {
        this.lfoPhase += this.d.lfoInc;
        if (this.lfoPhase >= 1) this.lfoPhase -= 1;
        let tri = 1 - 4 * Math.abs(this.lfoPhase - 0.5);
        tri = tri * (1.5 - 0.5 * tri * tri);
        if (this.lfoFade < 1) this.lfoFade = Math.min(1, this.lfoFade + this.lfoFadeInc);
        return tri * this.lfoFade;
    }

    private hpf(x: number): number {
        const lp = this.hpfLp.lowpass(x);
        switch (this.patch.hpf) {
            case 0:
                return x + (Math.pow(10, JUNO_CALIBRATION.hpfBoostDb / 20) - 1) * lp;
            case 1:
                return x;
            default:
                return x - lp;
        }
    }

    private readDelay(buf: Float32Array, delaySamples: number): number {
        const n = buf.length;
        let pos = this.writeIndex - delaySamples;
        while (pos < 0) pos += n;
        const i1 = Math.floor(pos);
        const f = pos - i1;
        const i0 = (i1 - 1 + n) % n;
        const i2 = (i1 + 1) % n;
        const i3 = (i1 + 2) % n;
        const y0 = buf[i0];
        const y1 = buf[i1 % n];
        const y2 = buf[i2];
        const y3 = buf[i3];
        // 4-point Hermite (Catmull-Rom).
        const c1 = 0.5 * (y2 - y0);
        const c2 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
        const c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);
        return ((c3 * f + c2) * f + c1) * f + y1;
    }

    /** Renders `frames` samples into `left`/`right` starting at `offset`, adding nothing (overwrites). */
    process(left: Float32Array, right: Float32Array, offset = 0, frames = left.length - offset) {
        const c = JUNO_CALIBRATION;
        const sr = this.sampleRate;
        const chorus = this.patch.chorus;
        const rate = chorus === 1 ? c.chorus1Hz : c.chorus2Hz;
        const depth = ((chorus === 1 ? c.chorus1DepthMs : c.chorus2DepthMs) / 1000) * sr;
        const centre = (c.chorusCentreMs / 1000) * sr;
        for (let i = offset; i < offset + frames; i++) {
            const lfo = this.lfoTick();
            let mono = 0;
            for (const v of this.voices) mono += v.tick(this.d, lfo, sr);
            mono = this.hpf(mono);

            if (chorus === 0) {
                left[i] = mono;
                right[i] = mono;
                continue;
            }
            this.chorusPhase += rate / sr;
            if (this.chorusPhase >= 1) this.chorusPhase -= 1;
            const tri = 1 - 4 * Math.abs(this.chorusPhase - 0.5);
            this.delayL[this.writeIndex] = mono;
            this.delayR[this.writeIndex] = mono;
            const wetL = this.chorusLpL.lowpass(this.readDelay(this.delayL, centre + depth * tri));
            const wetR = this.chorusLpR.lowpass(this.readDelay(this.delayR, centre - depth * tri));
            this.writeIndex = (this.writeIndex + 1) % this.delayL.length;
            left[i] = c.chorusDry * mono + c.chorusWet * wetL;
            right[i] = c.chorusDry * mono + c.chorusWet * wetR;
        }
    }
}

/** A note event for offline rendering: seconds from the start of the render. */
export interface NoteEvent {
    time: number;
    note: number;
    on: boolean;
}

/** Offline render of a note sequence; returns [left, right]. */
export function renderOffline(
    patch: JunoPatch,
    events: NoteEvent[],
    seconds: number,
    sampleRate = 44100,
): [Float32Array, Float32Array] {
    const engine = new JunoEngine(sampleRate, patch);
    const total = Math.ceil(seconds * sampleRate);
    const left = new Float32Array(total);
    const right = new Float32Array(total);
    const sorted = [...events].sort((a, b) => a.time - b.time);
    let pos = 0;
    for (const e of sorted) {
        const at = Math.min(total, Math.round(e.time * sampleRate));
        if (at > pos) engine.process(left, right, pos, at - pos);
        pos = Math.max(pos, at);
        if (e.on) engine.noteOn(e.note);
        else engine.noteOff(e.note);
    }
    if (pos < total) engine.process(left, right, pos, total - pos);
    return [left, right];
}
