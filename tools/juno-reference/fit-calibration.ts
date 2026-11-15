/**
 * Reads the reference's slider sweeps (npm run juno:reference -- --calibration)
 * and measures each slider law from the audio alone: seconds, Hz, dB, duty.
 * Prints the tables JunoEngine's JUNO_CALIBRATION is built from, and writes
 * them to .cache/juno-reference/calibration/fit.json.
 *
 *   npm run juno:fit
 */
import * as fs from 'fs';
import * as path from 'path';
import { readWav } from '../../src/public/daw/js/instruments/juno/reference/wav';
import { fftPower } from '../../src/public/daw/js/instruments/juno/reference/features';
import { CALIBRATION, CalibrationRender } from '../../src/public/daw/js/instruments/juno/reference/calibration';
import { SAMPLE_RATE, blockToSample } from '../../src/public/daw/js/instruments/juno/reference/testPatches';

const dir = path.join(__dirname, '../../.cache/juno-reference/calibration');
const SR = SAMPLE_RATE;

function load(r: CalibrationRender): Float32Array | undefined {
    const file = path.join(dir, `${r.name}.wav`);
    return fs.existsSync(file) ? readWav(fs.readFileSync(file)).channels[0] : undefined;
}

/** RMS envelope in dB, `win`-sample frames. */
function envelopeDb(x: Float32Array, win: number): number[] {
    const out: number[] = [];
    for (let i = 0; i + win <= x.length; i += win) {
        let s = 0;
        for (let k = i; k < i + win; k++) s += x[k] * x[k];
        out.push(10 * Math.log10(s / win + 1e-24));
    }
    return out;
}

const rms = (x: Float32Array, a: number, b: number) => {
    let s = 0;
    for (let i = a; i < b; i++) s += x[i] * x[i];
    return Math.sqrt(s / (b - a));
};

/** Frequency of the strongest spectral peak in [a, a+n), parabolic-interpolated, Hz. */
function peakHz(x: Float32Array, a: number, n = 32768, minHz = 8): number {
    const N = 65536;
    const buf = new Float32Array(N);
    for (let i = 0; i < n && a + i < x.length; i++)
        buf[i] = x[a + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
    const p = fftPower(buf);
    const binHz = SR / N;
    let best = Math.ceil(minHz / binHz);
    for (let i = best; i < p.length - 1; i++) if (p[i] > p[best]) best = i;
    const [l, c, r] = [p[best - 1], p[best], p[best + 1]].map((v) => Math.log(v + 1e-30));
    const shift = (l - r) / (2 * (l - 2 * c + r));
    return (best + (Number.isFinite(shift) ? shift : 0)) * binHz;
}

/** Amplitude of harmonic h of fundamental f0 in [a, a+n). */
function harmonic(x: Float32Array, a: number, f0: number, h: number, n = 32768): number {
    const N = 65536;
    const buf = new Float32Array(N);
    for (let i = 0; i < n; i++) buf[i] = x[a + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
    const p = fftPower(buf);
    const bin = Math.round((f0 * h * N) / SR);
    let m = 0;
    for (let i = bin - 3; i <= bin + 3; i++) m = Math.max(m, p[i]);
    return Math.sqrt(m);
}

/** Pitch track (Hz) by spectral peak in 4096-sample windows, hop 512, over [a, b). */
function pitchTrack(x: Float32Array, a: number, b: number, near: number): number[] {
    const out: number[] = [];
    const N = 16384;
    const W = 4096;
    for (let i = a; i + W <= b; i += 512) {
        const buf = new Float32Array(N);
        for (let k = 0; k < W; k++) buf[k] = x[i + k] * (0.5 - 0.5 * Math.cos((2 * Math.PI * k) / (W - 1)));
        const p = fftPower(buf);
        const binHz = SR / N;
        const lo = Math.floor((near * 0.7) / binHz);
        const hi = Math.ceil((near * 1.4) / binHz);
        let best = lo;
        for (let k = lo; k <= hi; k++) if (p[k] > p[best]) best = k;
        const [l, c, r] = [p[best - 1], p[best], p[best + 1]].map((v) => Math.log(v + 1e-30));
        out.push((best + (l - r) / (2 * (l - 2 * c + r))) * binHz);
    }
    return out;
}

/** Seconds for a dB line to fall 60 dB, fitted between `top` and `bottom` dB below `start`. */
function t60(env: number[], from: number, win: number, top = 3, bottom = 40): number {
    const ref = Math.max(...env.slice(from, from + 8));
    const pts: [number, number][] = [];
    for (let i = from; i < env.length; i++) {
        const d = ref - env[i];
        if (d >= top && d <= bottom) pts.push([(i * win) / SR, env[i]]);
        if (d > bottom) break;
    }
    if (pts.length < 2) return NaN;
    const n = pts.length;
    const mx = pts.reduce((s, p) => s + p[0], 0) / n;
    const my = pts.reduce((s, p) => s + p[1], 0) / n;
    const slope =
        pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
    return -60 / slope;
}

/** Undershoot target of the decay/release RC, as a fraction of full level (measured on release 16/24). */
export const ENV_UNDERSHOOT = 0.012;

/**
 * Seconds from `from` until the 128-sample RMS envelope first falls `db`
 * below `level`. For a(t) = (1+u)·e^(−t/τ) − u, the −20 dB point is at
 * t = τ·ln((1+u)/(0.1+u)), which gives τ directly.
 */
function crossing(x: Float32Array, from: number, level: number, db: number): number {
    const win = 128;
    const target = level * Math.pow(10, -db / 20);
    for (let i = from; i + win <= x.length; i += win) if (rms(x, i, i + win) < target) return (i + win / 2 - from) / SR;
    return NaN;
}
const tauFrom20 = (t20: number) => t20 / Math.log((1 + ENV_UNDERSHOOT) / (0.1 + ENV_UNDERSHOOT));

const fit: Record<string, Record<number, number>> = {};
const record = (group: string, v: number, value: number) => ((fit[group] ??= {})[v] = value);

for (const r of CALIBRATION) {
    const x = load(r);
    if (!x) continue;
    if (!r.notes.length) {
        // Idle renders: absolute floor, dBFS RMS, per channel.
        const all = readWav(fs.readFileSync(path.join(dir, `${r.name}.wav`))).channels;
        record(r.group, r.value, 20 * Math.log10(rms(all[0], SR / 2, x.length) + 1e-12));
        continue;
    }
    const onset = blockToSample(r.notes[0].onBlock);
    const off = blockToSample(r.notes[0].offBlock);
    const hold = [onset + Math.floor(0.3 * SR), Math.min(off, onset + Math.floor(1.0 * SR))];
    switch (r.group) {
        case 'attack': {
            const win = 64;
            const env = envelopeDb(x, win);
            const sustain = 20 * Math.log10(rms(x, off - SR / 2, off));
            const start = Math.floor(onset / win);
            // Linear attack: time to reach 90% amplitude, scaled to 100%.
            let i = start;
            while (i < env.length && env[i] < sustain + 20 * Math.log10(0.9)) i++;
            record('attack', r.value, ((i - start) * win) / SR / 0.9);
            break;
        }
        case 'decay': {
            // S = 0: after the instant attack the envelope decays from full to nothing.
            let peakAt = onset;
            let peak = 0;
            for (let i = onset; i < onset + 2048; i += 64) {
                const v = rms(x, i, i + 64);
                if (v > peak) [peak, peakAt] = [v, i];
            }
            record('decayTau', r.value, tauFrom20(crossing(x, peakAt, peak, 20)));
            record('decay40over20', r.value, crossing(x, peakAt, peak, 40) / crossing(x, peakAt, peak, 20));
            break;
        }
        case 'release': {
            const level = rms(x, off - 2048, off);
            record('releaseTau', r.value, tauFrom20(crossing(x, off, level, 20)));
            record('release40over20', r.value, crossing(x, off, level, 40) / crossing(x, off, level, 20));
            break;
        }
        case 'vcffreq':
        case 'vcfkbd':
        case 'vcfenv':
            record(r.group, r.value, peakHz(x, hold[0]));
            break;
        case 'lforate': {
            const track = pitchTrack(x, onset + SR / 2, off, 440);
            const mean = track.reduce((s, v) => s + v, 0) / track.length;
            const series = new Float32Array(32768);
            track.forEach((v, i) => (series[i] = v - mean));
            const p = fftPower(series);
            const hopHz = SR / 512;
            let best = 1;
            for (let i = 1; i < p.length; i++) if (p[i] > p[best]) best = i;
            record('lforate', r.value, (best * hopHz) / 32768);
            break;
        }
        case 'dcolfo': {
            const track = pitchTrack(x, onset + SR / 2, off, 440);
            const cents = track.map((f) => 1200 * Math.log2(f / 440));
            record('dcolfo', r.value, (Math.max(...cents) - Math.min(...cents)) / 2 / 100);
            break;
        }
        case 'lfodelay': {
            const track = pitchTrack(x, onset, off, 440).map((f) => 1200 * Math.log2(f / 440));
            const full = (Math.max(...track.slice(-200)) - Math.min(...track.slice(-200))) / 2;
            // Rolling half-span over ~one LFO cycle; first time it reaches 90% of full depth.
            let t = NaN;
            for (let i = 20; i < track.length; i++) {
                const w = track.slice(i - 20, i);
                if ((Math.max(...w) - Math.min(...w)) / 2 >= 0.9 * full) {
                    t = ((i - 20) * 512) / SR;
                    break;
                }
            }
            record('lfodelay', r.value, t);
            break;
        }
        case 'pwm': {
            const f0 = 110;
            const h1 = harmonic(x, hold[0], f0, 1);
            const h2 = harmonic(x, hold[0], f0, 2);
            // |h2/h1| = |cos(πd)| for a pulse of duty d, so d = 1/2 + asin(|h2/h1|)/π (d ≥ 1/2).
            record('pwm', r.value, 0.5 + Math.asin(Math.min(1, h2 / h1)) / Math.PI);
            record('pwmH2', r.value, 20 * Math.log10(h2 / h1));
            break;
        }
        case 'level':
        case 'vca':
        case 'sustain':
            record(r.group, r.value, 20 * Math.log10(rms(x, hold[0], hold[1]) + 1e-12));
            break;
    }
}

fs.writeFileSync(path.join(dir, 'fit.json'), JSON.stringify(fit, null, 2) + '\n');
for (const [group, values] of Object.entries(fit)) {
    console.log(
        `${group.padEnd(9)} ${Object.entries(values)
            .map(([k, v]) => `${k}:${Number(v).toPrecision(4)}`)
            .join('  ')}`,
    );
}
