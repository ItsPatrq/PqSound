import { JunoPatch } from '../JunoPatch';
import { TestNote, TestPatch } from './testPatches';
import { TEST_BASE } from './testPatches';

/**
 * Black-box measurement renders. Each sweeps one slider of the reference
 * across its range with everything else held still, so
 * tools/juno-reference/fit-calibration.ts can read that slider's law (Hz,
 * seconds, dB, duty) straight off the audio. Rendered un-normalised (--raw) so
 * levels compare across files.
 *
 * Nothing here is taken from the reference's source: the engine's calibration
 * tables are measurements of its output.
 */

export const SWEEP = Array.from({ length: 17 }, (_, i) => Math.min(127, i * 8));

export interface CalibrationRender extends TestPatch {
    group: string;
    value: number;
}

const hold = (note: number, onBlock: number, offBlock: number): TestNote[] => [{ note, onBlock, offBlock }];
const SEC = 44100 / 512; // blocks per second

function make(
    group: string,
    value: number,
    patch: Partial<JunoPatch>,
    notes: TestNote[],
    seconds: number,
): CalibrationRender {
    return {
        name: `cal-${group}-${value}`,
        group,
        value,
        patch: { ...TEST_BASE, ...patch },
        notes,
        lengthBlocks: Math.round(seconds * SEC),
        hold: [0, 0],
    };
}

const on = 8;
const offAt = (s: number) => Math.round(s * SEC);

export const CALIBRATION: CalibrationRender[] = [
    // Envelope stages (saw, filter open).
    ...SWEEP.map((v) => make('attack', v, { envA: v, envS: 127 }, hold(57, on, offAt(5)), 5.5)),
    ...SWEEP.map((v) => make('decay', v, { envD: v, envS: 0 }, hold(57, on, offAt(9.5)), 10)),
    ...SWEEP.map((v) => make('release', v, { envR: v }, hold(57, on, offAt(0.5)), 10)),
    // VCF: self-oscillation (no oscillator, full resonance) per cutoff byte.
    ...SWEEP.map((v) => make('vcffreq', v, { saw: false, vcfRes: 127, vcfFreq: v }, hold(60, on, offAt(1.4)), 1.5)),
    // VCF keyboard tracking at full KYBD: self-oscillation across notes.
    ...[36, 48, 60, 72, 84].map((n) =>
        make('vcfkbd', n, { saw: false, vcfRes: 127, vcfFreq: 40, vcfKbd: 127 }, hold(n, on, offAt(1.4)), 1.5),
    ),
    // VCF envelope depth: self-oscillation with the envelope held at 1 (A0 D-max S-max).
    ...[0, 32, 64, 96, 127].map((v) =>
        make(
            'vcfenv',
            v,
            { saw: false, vcfRes: 127, vcfFreq: 16, vcfEnv: v, envS: 127 },
            hold(60, on, offAt(1.4)),
            1.5,
        ),
    ),
    // LFO rate (full DCO LFO depth, so the rate shows as vibrato).
    ...SWEEP.map((v) => make('lforate', v, { lfoRate: v, dcoLfo: 127, vcfFreq: 127 }, hold(69, on, offAt(11.5)), 12)),
    // DCO LFO depth.
    ...[16, 32, 64, 96, 127].map((v) => make('dcolfo', v, { lfoRate: 40, dcoLfo: v }, hold(69, on, offAt(5.5)), 6)),
    // LFO delay.
    ...[32, 64, 96, 127].map((v) =>
        make('lfodelay', v, { lfoRate: 90, dcoLfo: 127, lfoDelay: v }, hold(69, on, offAt(5.5)), 6),
    ),
    // Pulse width (manual PWM).
    ...[0, 16, 32, 48, 64, 80, 96, 105, 127].map((v) =>
        make('pwm', v, { saw: false, pulse: true, dcoPwm: v }, hold(45, on, offAt(1.4)), 1.5),
    ),
    // Mixer levels, all at the same note.
    make('level', 0, { saw: true }, hold(45, on, offAt(1.4)), 1.5),
    make('level', 1, { saw: false, pulse: true }, hold(45, on, offAt(1.4)), 1.5),
    make('level', 2, { saw: false, dcoSub: 127 }, hold(45, on, offAt(1.4)), 1.5),
    make('level', 3, { saw: false, dcoNoise: 127 }, hold(45, on, offAt(1.4)), 1.5),
    make('level', 4, { saw: false, dcoSub: 64 }, hold(45, on, offAt(1.4)), 1.5),
    make('level', 5, { saw: false, dcoNoise: 64 }, hold(45, on, offAt(1.4)), 1.5),
    // VCA level law.
    ...[0, 32, 64, 96, 127].map((v) => make('vca', v, { vcaLevel: v }, hold(45, on, offAt(1.4)), 1.5)),
    // Sustain level law.
    ...[0, 32, 64, 96, 127].map((v) => make('sustain', v, { envS: v, envD: 0 }, hold(45, on, offAt(1.4)), 1.5)),
];
