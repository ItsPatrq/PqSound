import * as Utils from './Utils';

describe('Utils', () => {
    describe('isNullOrUndefined', () => {
        it('returns true for null and undefined', () => {
            expect(Utils.isNullOrUndefined(null)).toBe(true);
            expect(Utils.isNullOrUndefined(undefined)).toBe(true);
        });

        it('returns false for falsy but defined values', () => {
            expect(Utils.isNullOrUndefined(0)).toBe(false);
            expect(Utils.isNullOrUndefined('')).toBe(false);
            expect(Utils.isNullOrUndefined(false)).toBe(false);
        });
    });

    describe('isNullUndefinedOrEmpty', () => {
        it('returns true for null, undefined, empty array, empty string and empty object', () => {
            expect(Utils.isNullUndefinedOrEmpty(null)).toBe(true);
            expect(Utils.isNullUndefinedOrEmpty(undefined)).toBe(true);
            expect(Utils.isNullUndefinedOrEmpty([])).toBe(true);
            expect(Utils.isNullUndefinedOrEmpty('')).toBe(true);
            expect(Utils.isNullUndefinedOrEmpty({})).toBe(true);
        });

        it('returns false for non-empty values', () => {
            expect(Utils.isNullUndefinedOrEmpty([1])).toBe(false);
            expect(Utils.isNullUndefinedOrEmpty('a')).toBe(false);
            expect(Utils.isNullUndefinedOrEmpty({ a: 1 })).toBe(false);
        });
    });

    describe('getTrackByIndex', () => {
        const trackList = [
            { index: 0, name: 'first' },
            { index: 3, name: 'third' },
        ];

        it('returns the track with the matching index', () => {
            expect(Utils.getTrackByIndex(trackList, 3)).toBe(trackList[1]);
        });

        it('returns undefined when no track matches', () => {
            expect(Utils.getTrackByIndex(trackList, 7)).toBeUndefined();
        });
    });

    describe('getRegionsByTrackIndex', () => {
        const regionsByTrack = [
            { trackIndex: 0, regions: ['a'] },
            { trackIndex: 2, regions: ['b', 'c'] },
        ];

        it('returns regions for the matching track index', () => {
            expect(Utils.getRegionsByTrackIndex(regionsByTrack, 2)).toEqual(['b', 'c']);
        });

        it('returns undefined when no entry matches', () => {
            expect(Utils.getRegionsByTrackIndex(regionsByTrack, 9)).toBeUndefined();
        });
    });

    describe('removeAllFromArray', () => {
        it('removes every element matching the condition', () => {
            expect(Utils.removeAllFromArray([1, 2, 3, 2, 4], (x) => x === 2)).toEqual([1, 3, 4]);
        });

        it('does not mutate the input array', () => {
            const input = [1, 2, 3];
            Utils.removeAllFromArray(input, (x) => x === 2);
            expect(input).toEqual([1, 2, 3]);
        });
    });

    describe('removeFirstFromArray', () => {
        it('removes only the first element matching the condition', () => {
            expect(Utils.removeFirstFromArray([1, 2, 3, 2], (x) => x === 2)).toEqual([1, 3, 2]);
        });

        it('does not mutate the input array', () => {
            const input = [1, 2, 3];
            Utils.removeFirstFromArray(input, (x) => x === 2);
            expect(input).toEqual([1, 2, 3]);
        });
    });

    describe('noteToFrequency', () => {
        it('maps MIDI note 69 to 440 Hz (A4)', () => {
            expect(Utils.noteToFrequency(69)).toBeCloseTo(440.0);
        });

        it('maps an octave down/up to half/double frequency', () => {
            expect(Utils.noteToFrequency(57)).toBeCloseTo(220.0);
            expect(Utils.noteToFrequency(81)).toBeCloseTo(880.0);
        });
    });

    describe('noteToMIDI / MIDIToNote', () => {
        it('offsets note number by 21 (A0 = MIDI 21)', () => {
            expect(Utils.noteToMIDI(0)).toBe(21);
            expect(Utils.MIDIToNote(21)).toBe(0);
        });

        it('are inverse operations', () => {
            expect(Utils.MIDIToNote(Utils.noteToMIDI(48))).toBe(48);
        });
    });

    describe('copy', () => {
        beforeAll(() => {
            // Utils.copy references the AudioContext global, absent in the node test env.
            (global as any).AudioContext = class AudioContext {};
        });

        afterAll(() => {
            delete (global as any).AudioContext;
        });

        it('deep copies nested objects and arrays', () => {
            const source = { a: 1, nested: { b: [1, 2, { c: 3 }] } };
            const result = Utils.copy(source) as typeof source;
            expect(result).toEqual(source);
            expect(result).not.toBe(source);
            expect(result.nested).not.toBe(source.nested);
            expect(result.nested.b).not.toBe(source.nested.b);
        });

        it('returns null for AudioContext instances', () => {
            const ctx = new (global as any).AudioContext();
            expect(Utils.copy(ctx)).toBeNull();
        });
    });
});
