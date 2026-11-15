import { JunoEngine, renderOffline } from './JunoEngine';
import { defaultPatch, fromAprSysEx, toAprSysEx, JunoPatch } from './JunoPatch';
import { analyse, compare, pitchHz, BAND_CENTRES } from './reference/features';
import { TEST_PATCHES } from './reference/testPatches';
import { readWav, writeWav } from './reference/wav';
import { writeMidi } from './reference/midi';

const SR = 44100;
const held = (patch: JunoPatch, note: number, seconds = 1.0, offAt = seconds) =>
    renderOffline(
        patch,
        [
            { time: 0, note, on: true },
            { time: offAt, note, on: false },
        ],
        seconds,
        SR,
    )[0];

const plain: JunoPatch = {
    ...defaultPatch,
    vcfFreq: 127,
    vcfEnv: 0,
    vcfKbd: 0,
    envA: 0,
    envS: 127,
    chorus: 0,
    hpf: 1,
};

describe('JunoPatch SysEx', () => {
    it.each(TEST_PATCHES.map((t) => [t.name, t.patch] as const))('%s round-trips through an APR message', (_, p) => {
        const msg = toAprSysEx(p);
        expect(msg).toHaveLength(24);
        expect(msg[0]).toBe(0xf0);
        expect(msg[23]).toBe(0xf7);
        expect(msg.every((b) => b >= 0 && b <= 0xff)).toBe(true);
        expect(msg.slice(1, 23).every((b) => b <= 0x7f)).toBe(true);
        expect(fromAprSysEx(msg)).toEqual(p);
    });
});

describe('JunoEngine', () => {
    it('plays the note in tune (A3 = 220 Hz) and the octave switch moves it an octave', () => {
        const at8 = pitchHz(held(plain, 57), SR, 8192);
        const at16 = pitchHz(held({ ...plain, octave: 0 }, 57), SR, 8192);
        const at4 = pitchHz(held({ ...plain, octave: 2 }, 57), SR, 8192);
        expect(1200 * Math.log2(at8 / 220)).toBeCloseTo(0, 0);
        expect(1200 * Math.log2(at16 / 110)).toBeCloseTo(0, 0);
        expect(1200 * Math.log2(at4 / 440)).toBeCloseTo(0, 0);
    });

    it('darkens the sound as the cutoff slider comes down', () => {
        const highBands = (patch: JunoPatch) => {
            const a = analyse(held(patch, 57), SR);
            const top = BAND_CENTRES.findIndex((c) => c > 2000);
            let sum = 0;
            let all = 0;
            for (const f of a.bands.slice(10, 60)) {
                for (let k = 0; k < f.length; k++) {
                    all += f[k];
                    if (k >= top) sum += f[k];
                }
            }
            return sum / all;
        };
        const open = highBands(plain);
        const mid = highBands({ ...plain, vcfFreq: 70 });
        const closed = highBands({ ...plain, vcfFreq: 40 });
        expect(mid).toBeLessThan(open);
        expect(closed).toBeLessThan(mid);
    });

    it('self-oscillates at full resonance with no oscillator', () => {
        const out = held({ ...plain, saw: false, vcfRes: 127, vcfFreq: 64 }, 60, 1.5);
        let e = 0;
        for (let i = SR; i < 1.5 * SR; i++) e += out[i] * out[i];
        expect(Math.sqrt(e / (0.5 * SR))).toBeGreaterThan(0.01);
    });

    it('envelope: instant attack, then release decays to silence and frees the voice', () => {
        const engine = new JunoEngine(SR, { ...plain, envR: 20 });
        const l = new Float32Array(SR);
        const r = new Float32Array(SR);
        engine.noteOn(60);
        engine.process(l, r, 0, 2000);
        let early = 0;
        for (let i = 200; i < 400; i++) early = Math.max(early, Math.abs(l[i]));
        expect(early).toBeGreaterThan(0.1);
        engine.noteOff(60);
        engine.process(l, r, 2000, SR - 2000);
        expect(engine.activeVoices).toBe(0);
        let tail = 0;
        for (let i = SR - 1000; i < SR; i++) tail = Math.max(tail, Math.abs(l[i]));
        // Silent apart from the synth's own measured idle floor (−84 dBFS RMS hiss).
        expect(tail).toBeLessThan(1e-3);
    });

    it('has six voices: a seventh note steals rather than adding one', () => {
        const engine = new JunoEngine(SR, plain);
        const l = new Float32Array(128);
        const r = new Float32Array(128);
        for (let n = 60; n < 67; n++) engine.noteOn(n);
        engine.process(l, r);
        expect(engine.activeVoices).toBe(6);
    });

    it('renders deterministically, noise included', () => {
        const p = { ...plain, dcoNoise: 100, chorus: 1 as const };
        expect(held(p, 60, 0.3)).toEqual(held(p, 60, 0.3));
    });
});

describe('comparison metrics', () => {
    const t = TEST_PATCHES[0];
    const render = (p: JunoPatch) => analyse(held(p, 57, 1.5, 1.2), SR);

    it('score a render against itself as identical', () => {
        const a = render(t.patch);
        const r = compare(a, a, { holdStart: 0.4, holdEnd: 1.1 });
        expect(r.spectrogramDb).toBeCloseTo(0, 6);
        expect(r.timbreDb).toBeCloseTo(0, 6);
        expect(r.pitchCents).toBeCloseTo(0, 6);
    });

    it('see a 50-cent detune, a filter change, and a different envelope', () => {
        const ref = render(t.patch);
        const w = { holdStart: 0.4, holdEnd: 1.1 };
        const detuned = analyse(
            renderOffline(t.patch, [{ time: 0, note: 57, on: true }], 1.5, SR * Math.pow(2, -0.5 / 12))[0],
            SR,
        );
        expect(Math.abs(compare(detuned, ref, w).pitchCents)).toBeGreaterThan(40);
        expect(compare(render({ ...t.patch, vcfFreq: 60 }), ref, w).timbreDb).toBeGreaterThan(3);
        expect(compare(render({ ...t.patch, envA: 90 }), ref, w).loudnessP95Db).toBeGreaterThan(6);
    });

    it('round-trip WAV and write a well-formed MIDI file', () => {
        const x = held(plain, 57, 0.1);
        const back = readWav(writeWav({ sampleRate: SR, channels: [x] }));
        expect(back.sampleRate).toBe(SR);
        expect(Math.max(...back.channels[0].map((v, i) => Math.abs(v - x[i])))).toBeLessThan(1e-4);
        const mid = writeMidi([
            { tick: 0, bytes: toAprSysEx(plain) },
            { tick: 512, bytes: [0x90, 60, 100] },
        ]);
        expect(String.fromCharCode(...mid.slice(0, 4))).toBe('MThd');
        expect(String.fromCharCode(...mid.slice(14, 18))).toBe('MTrk');
    });
});
