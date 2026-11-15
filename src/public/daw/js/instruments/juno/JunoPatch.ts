/**
 * A Juno-106 patch, in the shape the hardware itself stores and transmits:
 * sixteen 7-bit sliders plus two switch bytes. Keeping that shape (rather than
 * pre-converted Hz/ms values) means a patch is exactly what goes over MIDI as a
 * Roland "All Parameter Report" SysEx, so the same bytes can drive this engine
 * and any other Juno-106 implementation — which is how JunoReference.test.ts
 * compares the two.
 *
 * Everything here is plain data, so a patch is safe to keep in the Redux store.
 */

export type Octave = 0 | 1 | 2; // 16', 8', 4'
export type ChorusMode = 0 | 1 | 2; // off, I, II
export type HpfPosition = 0 | 1 | 2 | 3; // 0 = bass boost, 1 = flat, 2/3 = high-pass

export interface JunoPatch {
    lfoRate: number;
    lfoDelay: number;
    dcoLfo: number;
    dcoPwm: number;
    dcoNoise: number;
    vcfFreq: number;
    vcfRes: number;
    vcfEnv: number;
    vcfLfo: number;
    vcfKbd: number;
    vcaLevel: number;
    envA: number;
    envD: number;
    envS: number;
    envR: number;
    dcoSub: number;
    octave: Octave;
    pulse: boolean;
    saw: boolean;
    chorus: ChorusMode;
    pwmManual: boolean;
    vcfEnvInvert: boolean;
    vcaGate: boolean;
    hpf: HpfPosition;
}

/** Slider order inside the SysEx message (Roland's parameter numbers 0x00–0x0F). */
export const SLIDERS = [
    'lfoRate',
    'lfoDelay',
    'dcoLfo',
    'dcoPwm',
    'dcoNoise',
    'vcfFreq',
    'vcfRes',
    'vcfEnv',
    'vcfLfo',
    'vcfKbd',
    'vcaLevel',
    'envA',
    'envD',
    'envS',
    'envR',
    'dcoSub',
] as const;

export type SliderName = (typeof SLIDERS)[number];

export const defaultPatch: JunoPatch = {
    lfoRate: 64,
    lfoDelay: 0,
    dcoLfo: 0,
    dcoPwm: 0,
    dcoNoise: 0,
    vcfFreq: 90,
    vcfRes: 0,
    vcfEnv: 30,
    vcfLfo: 0,
    vcfKbd: 64,
    vcaLevel: 64,
    envA: 0,
    envD: 60,
    envS: 90,
    envR: 40,
    dcoSub: 0,
    octave: 1,
    pulse: false,
    saw: true,
    chorus: 1,
    pwmManual: true,
    vcfEnvInvert: false,
    vcaGate: false,
    hpf: 1,
};

const clamp7 = (v: number) => Math.max(0, Math.min(127, Math.round(v)));

export function switchByte1(p: JunoPatch): number {
    let b = [0x01, 0x02, 0x04][p.octave];
    if (p.pulse) b |= 0x08;
    if (p.saw) b |= 0x10;
    if (p.chorus === 0) b |= 0x20;
    if (p.chorus === 1) b |= 0x40; // chorus I; bit clear with chorus on = II
    return b;
}

export function switchByte2(p: JunoPatch): number {
    let b = 0;
    if (p.pwmManual) b |= 0x01;
    if (p.vcfEnvInvert) b |= 0x02;
    if (p.vcaGate) b |= 0x04;
    b |= (3 - p.hpf) << 3; // hardware stores the HPF switch inverted
    return b;
}

/** Roland Juno-106 All Parameter Report: F0 41 30 0n pp [16 sliders] sw1 sw2 F7. */
export function toAprSysEx(p: JunoPatch, channel = 0, patchNumber = 0): number[] {
    return [
        0xf0,
        0x41,
        0x30,
        channel & 0x0f,
        patchNumber & 0x7f,
        ...SLIDERS.map((s) => clamp7(p[s])),
        switchByte1(p),
        switchByte2(p),
        0xf7,
    ];
}

export function fromAprSysEx(bytes: ArrayLike<number>): JunoPatch {
    if (bytes[0] !== 0xf0 || bytes[1] !== 0x41 || (bytes[2] !== 0x30 && bytes[2] !== 0x31)) {
        throw new Error('Not a Juno-106 All Parameter Report');
    }
    const sliders: Partial<JunoPatch> = {};
    SLIDERS.forEach((s, i) => (sliders[s] = bytes[5 + i]));
    const sw1 = bytes[21];
    const sw2 = bytes[22];
    return {
        ...(sliders as Pick<JunoPatch, SliderName>),
        octave: sw1 & 0x04 ? 2 : sw1 & 0x02 ? 1 : 0,
        pulse: (sw1 & 0x08) !== 0,
        saw: (sw1 & 0x10) !== 0,
        chorus: sw1 & 0x20 ? 0 : sw1 & 0x40 ? 1 : 2,
        pwmManual: (sw2 & 0x01) !== 0,
        vcfEnvInvert: (sw2 & 0x02) !== 0,
        vcaGate: (sw2 & 0x04) !== 0,
        hpf: (3 - ((sw2 >> 3) & 0x03)) as HpfPosition,
    };
}
