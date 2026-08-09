/**
 * @jest-environment jsdom
 */
import reducer, {
    addRegion,
    addNote,
    removeNote,
    pasteRegion,
    removeTrackFromComposition,
    regionTrackIndexUp,
    regionTrackIndexDown,
} from 'slices/compositionSlice';

/**
 * compositionSlice used to clone the entire region list on every note edit.
 * These cover the behaviour that had to survive replacing those clones with
 * targeted copies, and pin down that untouched regions keep their identity —
 * which is what makes the copies worth doing.
 */

const makeNote = (sixteenthNumber: number, length = 1) => ({ sixteenthNumber, length });

const makeRegion = (overrides: any = {}) => ({
    id: 1,
    trackIndex: 1,
    regionLength: 1,
    start: 0,
    end: 0,
    notes: new Array(88),
    ...overrides,
});

const makeState = (overrides: any = {}): any => ({
    barsInComposition: 48,
    maxBarsInComposition: 1000,
    showPianoRoll: false,
    showMixer: false,
    pianoRollRegion: null,
    regionList: [],
    regionLastId: 0,
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 48,
    ...overrides,
});

describe('compositionSlice', () => {
    describe('ADD_REGION', () => {
        it('appends a region and advances the id counter', () => {
            const state: any = reducer(makeState(), addRegion(2, 4, 2));

            expect(state.regionList).toHaveLength(1);
            expect(state.regionList[0]).toMatchObject({ id: 1, trackIndex: 2, start: 4, regionLength: 2, end: 5 });
            expect(state.regionLastId).toBe(1);
        });

        it('leaves existing regions as the same objects', () => {
            const existing = makeRegion({ id: 1 });
            const initial = makeState({ regionList: [existing], regionLastId: 1 });

            const state: any = reducer(initial, addRegion(1, 8, 1));

            expect(state.regionList[0]).toBe(existing);
            expect(state.regionList[1].id).toBe(2);
        });
    });

    describe('ADD_NOTE', () => {
        it('adds the note to the addressed row', () => {
            const initial = makeState({ regionList: [makeRegion({ id: 7 })] });

            const state: any = reducer(initial, addNote(7, 40, 3, 2));

            expect(state.regionList[0].notes[40]).toEqual([{ sixteenthNumber: 3, length: 2 }]);
        });

        it('appends to a row that already has notes', () => {
            const notes = new Array(88);
            notes[40] = [makeNote(0)];
            const initial = makeState({ regionList: [makeRegion({ id: 7, notes })] });

            const state: any = reducer(initial, addNote(7, 40, 8, 1));

            expect(state.regionList[0].notes[40]).toHaveLength(2);
            // The previous row array is not mutated.
            expect(notes[40]).toHaveLength(1);
        });

        it('copies only what it changes', () => {
            const otherNotes = new Array(88);
            otherNotes[10] = [makeNote(0)];
            const untouched = makeRegion({ id: 8, notes: otherNotes });
            const target = makeRegion({ id: 7 });
            const initial = makeState({ regionList: [target, untouched] });

            const state: any = reducer(initial, addNote(7, 40, 0, 1));

            // Other regions keep their identity — the point of dropping the
            // whole-composition deep copy.
            expect(state.regionList[1]).toBe(untouched);
            expect(state.regionList[0]).not.toBe(target);
            // Rows of the edited region that were not touched keep theirs too.
            expect(state.regionList[0].notes[10]).toBe(target.notes[10]);
        });
    });

    describe('REMOVE_NOTE', () => {
        it('removes the note covering the given sixteenth', () => {
            const notes = new Array(88);
            notes[40] = [makeNote(0, 4), makeNote(8, 2)];
            const initial = makeState({ regionList: [makeRegion({ id: 7, notes })] });

            const state: any = reducer(initial, removeNote(7, 40, 2, 1));

            expect(state.regionList[0].notes[40]).toEqual([{ sixteenthNumber: 8, length: 2 }]);
            expect(notes[40]).toHaveLength(2);
        });

        it('removes only the first match', () => {
            const notes = new Array(88);
            notes[40] = [makeNote(0, 4), makeNote(0, 4)];
            const initial = makeState({ regionList: [makeRegion({ id: 7, notes })] });

            const state: any = reducer(initial, removeNote(7, 40, 1, 1));

            expect(state.regionList[0].notes[40]).toHaveLength(1);
        });

        it('leaves the row alone when nothing covers that sixteenth', () => {
            const notes = new Array(88);
            notes[40] = [makeNote(0, 1)];
            const initial = makeState({ regionList: [makeRegion({ id: 7, notes })] });

            const state: any = reducer(initial, removeNote(7, 40, 9, 1));

            expect(state.regionList[0].notes[40]).toEqual([{ sixteenthNumber: 0, length: 1 }]);
        });
    });

    describe('PASTE_REGION', () => {
        it('copies the source notes into an independent region', () => {
            const notes = new Array(88);
            notes[40] = [makeNote(0, 2)];
            const source = makeRegion({ id: 3, regionLength: 2, notes });
            const initial = makeState({ regionList: [source], regionLastId: 3 });

            const state: any = reducer(initial, pasteRegion(2, 10, 3));

            const pasted = state.regionList[1];
            expect(pasted).toMatchObject({ id: 4, trackIndex: 2, start: 10, regionLength: 2, end: 11 });
            expect(pasted.notes[40]).toEqual([{ sixteenthNumber: 0, length: 2 }]);
            // Deep copy: editing the paste must not reach the source.
            expect(pasted.notes[40]).not.toBe(source.notes[40]);
            expect(pasted.notes[40][0]).not.toBe(source.notes[40][0]);
        });

        it('is a no-op when the copied region is gone', () => {
            const initial = makeState({ regionList: [], regionLastId: 0 });

            const state: any = reducer(initial, pasteRegion(1, 0, 99));

            expect(state).toBe(initial);
        });
    });

    describe('REMOVE_TRACK_FROM_COMPOSITION', () => {
        it("drops that track's regions and shifts the ones above it down", () => {
            const initial = makeState({
                regionList: [
                    makeRegion({ id: 1, trackIndex: 1 }),
                    makeRegion({ id: 2, trackIndex: 2 }),
                    makeRegion({ id: 3, trackIndex: 3 }),
                ],
            });

            const state: any = reducer(initial, removeTrackFromComposition(2));

            expect(state.regionList.map((region: any) => region.id)).toEqual([1, 3]);
            expect(state.regionList.map((region: any) => region.trackIndex)).toEqual([1, 2]);
            // The region below the removed track is untouched, not rebuilt.
            expect(state.regionList[0]).toBe(initial.regionList[0]);
        });
    });

    describe('REGION_TRACK_INDEX_UP / DOWN', () => {
        it('swaps the two affected track indices', () => {
            const initial = makeState({
                regionList: [
                    makeRegion({ id: 1, trackIndex: 1 }),
                    makeRegion({ id: 2, trackIndex: 2 }),
                    makeRegion({ id: 3, trackIndex: 5 }),
                ],
            });

            const up: any = reducer(initial, regionTrackIndexUp(1));
            expect(up.regionList.map((region: any) => region.trackIndex)).toEqual([2, 1, 5]);
            expect(up.regionList[2]).toBe(initial.regionList[2]);

            const down: any = reducer(initial, regionTrackIndexDown(2));
            expect(down.regionList.map((region: any) => region.trackIndex)).toEqual([2, 1, 5]);
        });
    });
});
