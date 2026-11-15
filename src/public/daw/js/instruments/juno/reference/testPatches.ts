import { JunoPatch, defaultPatch } from '../JunoPatch';

/**
 * Patches the reference comparison renders through both engines. Each one
 * isolates a feature, so a failure points at the part of the engine that is
 * off. They are written for this test, not taken from a factory bank.
 *
 * Note events are given in samples at 44.1 kHz and sit on multiples of 512:
 * renderers that apply MIDI at block boundaries (the reference renders in
 * 512-sample blocks) then place them on exactly the same sample as ours.
 */

export const SAMPLE_RATE = 44100;
const BLOCK = 512;

export interface TestNote {
    note: number;
    onBlock: number;
    offBlock: number;
}

export interface TestPatch {
    name: string;
    patch: JunoPatch;
    notes: TestNote[];
    /** Total compared length, in blocks. */
    lengthBlocks: number;
    /** Held window used for pitch/timbre, seconds. */
    hold: [number, number];
}

export const TEST_BASE: JunoPatch = {
    ...defaultPatch,
    vcfFreq: 127,
    vcfRes: 0,
    vcfEnv: 0,
    vcfKbd: 0,
    vcfLfo: 0,
    dcoLfo: 0,
    dcoNoise: 0,
    dcoSub: 0,
    envA: 0,
    envD: 60,
    envS: 127,
    envR: 30,
    saw: true,
    pulse: false,
    chorus: 0,
    hpf: 1,
    octave: 1,
    pwmManual: true,
    dcoPwm: 0,
    vcfEnvInvert: false,
    vcaGate: false,
    vcaLevel: 64,
    lfoDelay: 0,
    lfoRate: 64,
};

const single = (note: number): TestNote[] => [{ note, onBlock: 8, offBlock: 120 }];

export const TEST_PATCHES: TestPatch[] = [
    { name: 'saw-open', patch: { ...TEST_BASE }, notes: single(57), lengthBlocks: 172, hold: [0.4, 1.3] },
    {
        name: 'square',
        patch: { ...TEST_BASE, saw: false, pulse: true, vcfFreq: 110 },
        notes: single(45),
        lengthBlocks: 172,
        hold: [0.4, 1.3],
    },
    {
        name: 'pwm-lfo',
        patch: { ...TEST_BASE, saw: false, pulse: true, dcoPwm: 90, pwmManual: false, lfoRate: 60, vcfFreq: 100 },
        notes: single(57),
        lengthBlocks: 258,
        hold: [0.4, 2.0],
    },
    {
        name: 'sub-bass',
        patch: { ...TEST_BASE, dcoSub: 127, octave: 0, vcfFreq: 50, vcfRes: 40 },
        notes: single(48),
        lengthBlocks: 172,
        hold: [0.4, 1.3],
    },
    {
        name: 'pluck',
        patch: { ...TEST_BASE, vcfFreq: 20, vcfEnv: 100, vcfRes: 60, envD: 50, envS: 0, envR: 30 },
        notes: single(60),
        lengthBlocks: 172,
        hold: [0.1, 0.5],
    },
    {
        name: 'resonant',
        patch: { ...TEST_BASE, vcfFreq: 64, vcfRes: 110, vcfKbd: 127 },
        notes: single(48),
        lengthBlocks: 172,
        hold: [0.4, 1.3],
    },
    {
        name: 'pad-chorus1',
        patch: {
            ...TEST_BASE,
            pulse: true,
            dcoPwm: 50,
            vcfFreq: 70,
            vcfEnv: 40,
            envA: 80,
            envD: 80,
            envS: 80,
            envR: 80,
            chorus: 1,
        },
        notes: [48, 55, 60, 64].map((note) => ({ note, onBlock: 8, offBlock: 258 })),
        lengthBlocks: 388,
        hold: [2.0, 2.9],
    },
    {
        name: 'chorus2',
        patch: { ...TEST_BASE, vcfFreq: 90, chorus: 2 },
        notes: single(57),
        lengthBlocks: 258,
        hold: [0.4, 2.0],
    },
    {
        name: 'noise-hpf3',
        patch: { ...TEST_BASE, saw: false, dcoNoise: 127, hpf: 3 },
        notes: single(60),
        lengthBlocks: 172,
        hold: [0.4, 1.3],
    },
    {
        name: 'vibrato',
        patch: { ...TEST_BASE, dcoLfo: 60, lfoRate: 70, vcfFreq: 100 },
        notes: single(69),
        lengthBlocks: 258,
        hold: [0.4, 2.0],
    },
    {
        name: 'gate-invenv',
        patch: {
            ...TEST_BASE,
            pulse: true,
            vcaGate: true,
            vcfFreq: 80,
            vcfEnv: 60,
            vcfEnvInvert: true,
            envD: 60,
            envS: 30,
        },
        notes: single(52),
        lengthBlocks: 172,
        hold: [0.4, 1.3],
    },
    {
        name: 'hpf0-boost',
        patch: { ...TEST_BASE, dcoSub: 100, hpf: 0, vcfFreq: 80 },
        notes: single(40),
        lengthBlocks: 172,
        hold: [0.4, 1.3],
    },
];

export const blockToSample = (b: number) => b * BLOCK;

/**
 * MIDI tick for an event meant to land on block `b`. The reference converts
 * ticks to samples in floating point, so tick N comes out as N − ε and, being
 * truncated, falls into the *previous* 512-sample block, which it applies at
 * that block's start: one block early. One tick (one sample) later truncates
 * into the intended block, which it then applies at exactly blockToSample(b).
 */
export const blockToTick = (b: number) => b * BLOCK + 1;
export const lengthSamples = (t: TestPatch) => blockToSample(t.lengthBlocks);
