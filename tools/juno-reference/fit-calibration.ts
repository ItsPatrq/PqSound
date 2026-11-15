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
import {
    SAMPLE_RATE,
    blockToSample,
    lengthSamples,
} from '../../src/public/daw/js/instruments/juno/reference/testPatches';
import { renderOffline } from '../../src/public/daw/js/instruments/juno/JunoEngine';

const dir = path.join(__dirname, '../../.cache/juno-reference/calibration');
const SR = SAMPLE_RATE;

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

/** Frequency of a (self-oscillating) sine over time: strongest peak per 2048-sample window, hop 512. */
function sineTrack(x: Float32Array, a: number, b: number): number[] {
    const N = 8192;
    const W = 2048;
    const out: number[] = [];
    for (let i = a; i + W <= b; i += 512) {
        const buf = new Float32Array(N);
        for (let k = 0; k < W; k++) buf[k] = x[i + k] * (0.5 - 0.5 * Math.cos((2 * Math.PI * k) / (W - 1)));
        const p = fftPower(buf);
        let best = 3;
        for (let k = 3; k < p.length - 1; k++) if (p[k] > p[best]) best = k;
        const [l, c, r] = [p[best - 1], p[best], p[best + 1]].map((v) => Math.log(v + 1e-30));
        out.push((best + (l - r) / (2 * (l - 2 * c + r))) * (SR / N));
    }
    return out;
}

/** Averaged noise spectrum in [a, b), dB, 4096-point. */
function noiseSpectrumDb(x: Float32Array, a: number, b: number): Float64Array {
    const N = 4096;
    const acc = new Float64Array(N / 2);
    let n = 0;
    for (let i = a; i + N <= b; i += N / 2, n++) {
        const buf = new Float32Array(N);
        for (let k = 0; k < N; k++) buf[k] = x[i + k] * (0.5 - 0.5 * Math.cos((2 * Math.PI * k) / (N - 1)));
        fftPower(buf).forEach((v, k) => (acc[k] += v));
    }
    return acc.map((v) => 10 * Math.log10(v / n + 1e-30));
}
const binOf = (hz: number) => Math.round((hz * 4096) / SR);
const bandDb = (spec: Float64Array, lo: number, hi: number) => {
    let s = 0;
    for (let k = binOf(lo); k <= binOf(hi); k++) s += Math.pow(10, spec[k] / 10);
    return 10 * Math.log10(s / (binOf(hi) - binOf(lo) + 1));
};

/**
 * Decay time constant by log-linear regression of the amplitude envelope over
 * the part of the curve 3–30 dB below its level 40 ms after `from`, skipping
 * the attack transient that biased a single −20 dB crossing.
 */
function expTau(x: Float32Array, from: number, maxSec: number): number {
    const win = 512;
    const start = from + Math.round(0.04 * SR);
    const ref = rms(x, start, start + win);
    const pts: [number, number][] = [];
    for (let i = start; i + win <= Math.min(x.length, from + maxSec * SR); i += win) {
        const d = 20 * Math.log10(rms(x, i, i + win) / ref);
        if (d < -30) break;
        if (d <= -3) pts.push([(i - start) / SR, Math.log(rms(x, i, i + win))]);
    }
    if (pts.length < 3) return NaN;
    const n = pts.length;
    const mx = pts.reduce((s, q) => s + q[0], 0) / n;
    const my = pts.reduce((s, q) => s + q[1], 0) / n;
    const slope =
        pts.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0) / pts.reduce((s, q) => s + (q[0] - mx) ** 2, 0);
    return -1 / slope;
}

type Fit = Record<string, Record<number, number>>;
let tracks: Record<string, number[]> = {};
let fit: Fit = {};
const record = (group: string, v: number, value: number) => ((fit[group] ??= {})[v] = value);

function measureAll(get: (r: CalibrationRender) => Float32Array[] | undefined) {
    fit = {};
    tracks = {};
    for (const r of CALIBRATION) {
        const chs = get(r);
        if (!chs) continue;
        const x = chs[0];
        if (!r.notes.length) {
            // Idle renders: absolute floor, dBFS RMS, per channel.
            const all = chs;
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
                record('decayTau', r.value, expTau(x, peakAt, 9));
                record('decay40over20', r.value, crossing(x, peakAt, peak, 40) / crossing(x, peakAt, peak, 20));
                break;
            }
            case 'release': {
                const level = rms(x, off - 2048, off);
                record('releaseTau', r.value, tauFrom20(crossing(x, off, level, 20)));
                record('releaseTauExp', r.value, expTau(x, off, 9.4));
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
            case 'envtrack': {
                // Cutoff (as self-oscillation Hz) every 512 samples from note-on to 0.5 s after note-off.
                tracks[`envtrack-${r.value}`] = sineTrack(x, onset, Math.min(x.length, off + SR / 2)).map((f) =>
                    Math.round(f),
                );
                break;
            }
            case 'dc': {
                // Running mean (DC) per 1024 samples, ×10⁴, from 0.1 s before note-on.
                const out: number[] = [];
                for (let i = onset - 4096; i + 1024 <= Math.min(x.length, off + SR / 2); i += 1024) {
                    let m = 0;
                    for (let k = i; k < i + 1024; k++) m += x[k];
                    out.push(Math.round((m / 1024) * 1e4));
                }
                tracks[`dc-${r.value}`] = out;
                break;
            }
            case 'vcfres': {
                const spec = noiseSpectrumDb(x, onset + SR / 2, off);
                let peakK = binOf(100);
                for (let k = binOf(100); k < binOf(8000); k++) if (spec[k] > spec[peakK]) peakK = k;
                const pass = bandDb(spec, 60, 200);
                record('vcfresPeakDb', r.value, spec[peakK] - pass);
                record('vcfresPeakHz', r.value, (peakK * SR) / 4096);
                record('vcfresPassDb', r.value, pass);
                break;
            }
            case 'vcfslope': {
                const spec = noiseSpectrumDb(x, onset + SR / 2, off);
                const fc = [67.36, 797.2, 9314][[32, 64, 96].indexOf(r.value)];
                const pass = bandDb(spec, fc / 4, fc / 2);
                record('vcfslopeAt1oct', r.value, bandDb(spec, fc * 1.9, fc * 2.1) - pass);
                record('vcfslopeAt2oct', r.value, bandDb(spec, fc * 3.8, fc * 4.2) - pass);
                break;
            }
            case 'chorusmod': {
                const all = chs;
                for (const [ci, ch] of all.entries()) {
                    const tr = sineTrack(ch, onset + SR, off);
                    const mean = tr.reduce((s, v) => s + v, 0) / tr.length;
                    const dev = tr.map((f) => f / mean - 1);
                    const series = new Float32Array(16384);
                    dev.forEach((v, i) => (series[i] = v));
                    const p = fftPower(series);
                    let best = 2;
                    for (let i = 2; i < 2000; i++) if (p[i] > p[best]) best = i;
                    const rate = (best * (SR / 512)) / 16384;
                    const peak = (Math.max(...dev) - Math.min(...dev)) / 2;
                    // Triangle delay d(t) of peak D at rate f gives pitch deviation ±4·D·f.
                    record(`chorus${r.value}RateHz`, ci, rate);
                    record(`chorus${r.value}DepthMs`, ci, (peak / (4 * rate)) * 1000);
                    record(`chorus${r.value}Hz`, ci, mean);
                }
                break;
            }
            case 'vcflfo': {
                const tr = sineTrack(x, onset + SR, off).map((f) => Math.log2(f));
                record('vcflfoOct', r.value, (Math.max(...tr) - Math.min(...tr)) / 2);
                break;
            }
            case 'level':
            case 'vca':
            case 'sustain':
                record(r.group, r.value, 20 * Math.log10(rms(x, hold[0], hold[1]) + 1e-12));
                break;
        }
    }

    return { fit, tracks };
}

const reference = measureAll((r) => {
    const file = path.join(dir, `${r.name}.wav`);
    return fs.existsSync(file) ? readWav(fs.readFileSync(file)).channels : undefined;
});
fs.writeFileSync(
    path.join(dir, 'fit.json'),
    JSON.stringify({ ...reference.fit, tracks: reference.tracks }, null, 2) + '\n',
);

// --ours: the same sweeps through PqSound's engine, measured identically, so
// any estimator bias cancels and the two columns can be compared directly.
const wanted = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ours = process.argv.includes('--ours')
    ? measureAll((r) => {
          // Render only what was asked for: a group name, or a track like envtrack-0.
          if (wanted.length && !wanted.some((w) => w === r.group || w.startsWith(r.group))) return undefined;
          const events = r.notes.flatMap((n) => [
              { time: blockToSample(n.onBlock) / SR, note: n.note, on: true },
              { time: blockToSample(n.offBlock) / SR, note: n.note, on: false },
          ]);
          return renderOffline(r.patch, events, lengthSamples(r) / SR, SR);
      })
    : undefined;

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
for (const [group, values] of Object.entries(reference.fit)) {
    if (only.length && !only.includes(group)) continue;
    const mine = ours?.fit[group];
    console.log(
        `${group.padEnd(14)} ${Object.entries(values)
            .map(
                ([k, v]) =>
                    `${k}:${Number(v).toPrecision(4)}${mine ? `/${Number(mine[Number(k)]).toPrecision(4)}` : ''}`,
            )
            .join('  ')}`,
    );
}
if (ours) {
    for (const k of Object.keys(reference.tracks)) {
        if (only.length && !only.includes(k)) continue;
        const a = reference.tracks[k].filter((_, i) => i % 6 === 0);
        const b = ours.tracks[k].filter((_, i) => i % 6 === 0);
        console.log(`${k}\n  ref  ${a.join(' ')}\n  ours ${b.join(' ')}`);
    }
}
