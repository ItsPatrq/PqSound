/**
 * Standard MIDI File (format 0) writer for reference renders.
 *
 * Timing is chosen so one tick is exactly one sample at 44.1 kHz: division 441
 * ticks per quarter at a tempo of 10 000 µs per quarter. Event positions are
 * then sample-exact in any renderer that converts ticks to samples, with no
 * rounding to argue about.
 */

export const TICKS_PER_QUARTER = 441;
export const MICROSECONDS_PER_QUARTER = 10000;
export const SAMPLES_PER_TICK_AT_44100 = 1;

export interface MidiEvent {
    tick: number;
    bytes: number[]; // a channel message, or a full SysEx starting with 0xF0
}

function varLen(n: number): number[] {
    const out = [n & 0x7f];
    n >>= 7;
    while (n > 0) {
        out.unshift((n & 0x7f) | 0x80);
        n >>= 7;
    }
    return out;
}

export function writeMidi(events: MidiEvent[]): Uint8Array {
    const sorted = [...events].sort((a, b) => a.tick - b.tick);
    const track: number[] = [];
    // Tempo meta event at tick 0.
    track.push(
        0,
        0xff,
        0x51,
        0x03,
        (MICROSECONDS_PER_QUARTER >> 16) & 0xff,
        (MICROSECONDS_PER_QUARTER >> 8) & 0xff,
        MICROSECONDS_PER_QUARTER & 0xff,
    );
    let last = 0;
    for (const e of sorted) {
        track.push(...varLen(e.tick - last));
        last = e.tick;
        if (e.bytes[0] === 0xf0) {
            const payload = e.bytes.slice(1); // includes the trailing F7
            track.push(0xf0, ...varLen(payload.length), ...payload);
        } else {
            track.push(...e.bytes);
        }
    }
    track.push(0, 0xff, 0x2f, 0x00);
    const header = [
        ...[0x4d, 0x54, 0x68, 0x64],
        0,
        0,
        0,
        6,
        0,
        0, // format 0
        0,
        1, // one track
        (TICKS_PER_QUARTER >> 8) & 0xff,
        TICKS_PER_QUARTER & 0xff,
    ];
    const len = track.length;
    const trackHeader = [
        0x4d,
        0x54,
        0x72,
        0x6b,
        (len >>> 24) & 0xff,
        (len >>> 16) & 0xff,
        (len >>> 8) & 0xff,
        len & 0xff,
    ];
    return Uint8Array.from([...header, ...trackHeader, ...track]);
}
