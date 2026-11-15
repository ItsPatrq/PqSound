/**
 * Perceptually-motivated comparison of two renders of the same patch.
 *
 * "Sounds similar" is broken into things a listener hears separately, each
 * compared on a dB or cents scale so tolerances mean something:
 *
 *   - pitch          fundamental of the held note, cents
 *   - timbre         average spectrum in 1/3-octave bands over the held part, dB
 *   - loudness curve RMS per 11.6 ms frame across the whole render, dB
 *   - spectrogram    the band spectrum frame by frame (timbre *and* its motion:
 *                    filter sweeps, PWM, chorus), dB
 *
 * Both signals are level-normalised first (renderers normalise differently,
 * and absolute level is not part of the timbre), and each frame is floored at
 * −60 dB below the loudest frame so silence and noise floors don't dominate.
 */

export const FRAME = 2048;
export const HOP = 512;
const FLOOR_DB = -60;

export function mixToMono(channels: Float32Array[]): Float32Array {
    if (channels.length === 1) return channels[0];
    const out = new Float32Array(channels[0].length);
    for (const ch of channels) for (let i = 0; i < out.length; i++) out[i] += ch[i] / channels.length;
    return out;
}

export function fftPower(frame: Float32Array): Float32Array {
    const n = frame.length;
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    for (let i = 0; i < n; i++) re[i] = frame[i];
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }
    for (let len = 2; len <= n; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        const wr = Math.cos(ang);
        const wi = Math.sin(ang);
        for (let i = 0; i < n; i += len) {
            let cr = 1;
            let ci = 0;
            for (let k = 0; k < len / 2; k++) {
                const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
                const ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
                re[i + k + len / 2] = re[i + k] - ar;
                im[i + k + len / 2] = im[i + k] - ai;
                re[i + k] += ar;
                im[i + k] += ai;
                const ncr = cr * wr - ci * wi;
                ci = cr * wi + ci * wr;
                cr = ncr;
            }
        }
    }
    const mags = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) mags[i] = re[i] * re[i] + im[i] * im[i];
    return mags; // power
}

const hann = (() => {
    const w = new Float32Array(FRAME);
    for (let i = 0; i < FRAME; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FRAME - 1));
    return w;
})();

/** 1/3-octave band centres from 50 Hz to 16 kHz. */
export const BAND_CENTRES = Array.from({ length: 26 }, (_, i) => 50 * Math.pow(2, i / 3));

export interface Analysis {
    sampleRate: number;
    /** frames × bands, power (linear). */
    bands: Float64Array[];
    /** per-frame RMS power (linear). */
    power: Float64Array;
    signal: Float32Array;
}

export function analyse(signal: Float32Array, sampleRate: number): Analysis {
    // Level-normalise to unit RMS over the loud part of the signal.
    let peak = 0;
    for (const v of signal) peak = Math.max(peak, Math.abs(v));
    let sum = 0;
    let n = 0;
    for (const v of signal)
        if (Math.abs(v) > peak * 0.01) {
            sum += v * v;
            n++;
        }
    const scale = n ? 1 / Math.sqrt(sum / n) : 1;
    const x = signal.map((v) => v * scale);

    const binHz = sampleRate / FRAME;
    const edges = BAND_CENTRES.map((c) => [c * Math.pow(2, -1 / 6), c * Math.pow(2, 1 / 6)]);
    const frames = Math.max(0, Math.floor((x.length - FRAME) / HOP) + 1);
    const bands: Float64Array[] = [];
    const power = new Float64Array(frames);
    const buf = new Float32Array(FRAME);
    for (let f = 0; f < frames; f++) {
        let e = 0;
        for (let i = 0; i < FRAME; i++) {
            const v = x[f * HOP + i];
            buf[i] = v * hann[i];
            e += v * v;
        }
        power[f] = e / FRAME;
        const mags = fftPower(buf);
        const b = new Float64Array(BAND_CENTRES.length);
        edges.forEach(([lo, hi], k) => {
            const i0 = Math.max(1, Math.floor(lo / binHz));
            const i1 = Math.min(mags.length - 1, Math.ceil(hi / binHz));
            let s = 0;
            for (let i = i0; i <= i1; i++) s += mags[i];
            b[k] = s;
        });
        bands.push(b);
    }
    return { sampleRate, bands, power, signal: x };
}

const db = (p: number) => 10 * Math.log10(p + 1e-20);

/** Fundamental by normalised autocorrelation over a window, Hz (0 if aperiodic). */
export function pitchHz(signal: Float32Array, sampleRate: number, start: number, length = 8192): number {
    const s = signal.subarray(start, start + length);
    const minLag = Math.floor(sampleRate / 2000);
    const maxLag = Math.floor(sampleRate / 25);
    const n = s.length - maxLag;
    if (n <= 0) return 0;
    const r = new Float64Array(maxLag + 2);
    let e0 = 0;
    for (let i = 0; i < n; i++) e0 += s[i] * s[i];
    for (let lag = minLag; lag <= maxLag + 1; lag++) {
        let acc = 0;
        let e1 = 0;
        for (let i = 0; i < n; i++) {
            acc += s[i] * s[i + lag];
            e1 += s[i + lag] * s[i + lag];
        }
        r[lag] = acc / Math.sqrt(e0 * e1 + 1e-20);
    }
    // First lag whose correlation is within 10% of the global maximum: avoids
    // picking a sub-harmonic (e.g. the sub-oscillator period would otherwise
    // win when the sub is loud).
    let best = minLag;
    let max = -1;
    for (let lag = minLag; lag <= maxLag; lag++) if (r[lag] > max) max = r[lag];
    if (max < 0.5) return 0;
    for (let lag = minLag + 1; lag <= maxLag; lag++) {
        if (r[lag] >= 0.9 * max && r[lag] >= r[lag - 1] && r[lag] >= r[lag + 1]) {
            best = lag;
            break;
        }
    }
    const a = r[best - 1];
    const b = r[best];
    const c = r[best + 1];
    const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
    return sampleRate / (best + (Number.isFinite(shift) ? shift : 0));
}

export interface Comparison {
    /** Pitch difference of the held note, cents (NaN when either side is aperiodic). */
    pitchCents: number;
    /** Mean |ΔdB| of the 1/3-octave spectrum over the held window. */
    timbreDb: number;
    /** Mean |ΔdB| of the frame loudness curve. */
    loudnessDb: number;
    /** 95th-percentile |ΔdB| of the loudness curve: catches local errors (attack, release) a mean dilutes. */
    loudnessP95Db: number;
    /** Mean |ΔdB| over frames × bands. */
    spectrogramDb: number;
    /** Frame offset (ours relative to reference) that best aligned the two. */
    lagFrames: number;
}

export interface CompareWindow {
    /** Held-note window, seconds, used for pitch and timbre. */
    holdStart: number;
    holdEnd: number;
}

function frameDb(a: Analysis) {
    let maxP = 0;
    for (const p of a.power) maxP = Math.max(maxP, p);
    const ref = db(maxP);
    const loud = Array.from(a.power, (p) => Math.max(FLOOR_DB, db(p) - ref));
    let maxB = 0;
    for (const f of a.bands) for (const v of f) maxB = Math.max(maxB, v);
    const refB = db(maxB);
    const bands = a.bands.map((f) => Array.from(f, (v) => Math.max(FLOOR_DB, db(v) - refB)));
    return { loud, bands };
}

export function compare(ours: Analysis, reference: Analysis, w: CompareWindow, maxLag = 4): Comparison {
    const A = frameDb(ours);
    const B = frameDb(reference);
    const frames = Math.min(A.loud.length, B.loud.length);

    // Small alignment search: renderers may quantise note-on to their block size.
    let lagFrames = 0;
    let bestLoud = Infinity;
    for (let lag = -maxLag; lag <= maxLag; lag++) {
        let s = 0;
        let n = 0;
        for (let f = 0; f < frames; f++) {
            const g = f + lag;
            if (g < 0 || g >= A.loud.length) continue;
            if (B.loud[f] <= FLOOR_DB && A.loud[g] <= FLOOR_DB) continue;
            s += Math.abs(A.loud[g] - B.loud[f]);
            n++;
        }
        const m = n ? s / n : Infinity;
        if (m < bestLoud) {
            bestLoud = m;
            lagFrames = lag;
        }
    }

    const diffs: number[] = [];
    for (let f = 0; f < frames; f++) {
        const g = f + lagFrames;
        if (g < 0 || g >= A.loud.length) continue;
        if (B.loud[f] <= FLOOR_DB && A.loud[g] <= FLOOR_DB) continue;
        diffs.push(Math.abs(A.loud[g] - B.loud[f]));
    }
    diffs.sort((a, b) => a - b);
    const loudnessP95Db = diffs.length ? diffs[Math.min(diffs.length - 1, Math.floor(diffs.length * 0.95))] : 0;

    let spec = 0;
    let specN = 0;
    for (let f = 0; f < frames; f++) {
        const g = f + lagFrames;
        if (g < 0 || g >= A.bands.length) continue;
        for (let k = 0; k < BAND_CENTRES.length; k++) {
            const a = A.bands[g][k];
            const b = B.bands[f][k];
            if (a <= FLOOR_DB && b <= FLOOR_DB) continue;
            spec += Math.abs(a - b);
            specN++;
        }
    }

    const sr = reference.sampleRate;
    const f0 = Math.floor((w.holdStart * sr) / HOP);
    const f1 = Math.floor((w.holdEnd * sr - FRAME) / HOP);
    const avg = (a: Analysis, offset: number) => {
        const out = new Float64Array(BAND_CENTRES.length);
        for (let f = f0; f <= f1; f++) for (let k = 0; k < out.length; k++) out[k] += a.bands[f + offset]?.[k] ?? 0;
        let max = 0;
        for (const v of out) max = Math.max(max, v);
        return Array.from(out, (v) => Math.max(FLOOR_DB, db(v) - db(max)));
    };
    const ta = avg(ours, lagFrames);
    const tb = avg(reference, 0);
    let timbre = 0;
    let timbreN = 0;
    for (let k = 0; k < ta.length; k++) {
        if (ta[k] <= FLOOR_DB && tb[k] <= FLOOR_DB) continue;
        timbre += Math.abs(ta[k] - tb[k]);
        timbreN++;
    }

    const holdSample = Math.floor(w.holdStart * sr);
    const pa = pitchHz(ours.signal, sr, holdSample + lagFrames * HOP);
    const pb = pitchHz(reference.signal, sr, holdSample);
    const pitchCents = pa > 0 && pb > 0 ? 1200 * Math.log2(pa / pb) : NaN;

    return {
        pitchCents,
        timbreDb: timbreN ? timbre / timbreN : 0,
        loudnessDb: bestLoud,
        loudnessP95Db,
        spectrogramDb: specN ? spec / specN : 0,
        lagFrames,
    };
}
