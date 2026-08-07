/**
 * @jest-environment jsdom
 */
import reducer from 'reducers/tracksReducer';
import { TrackTypes } from 'constants/Constants';

/**
 * tracksReducer is now pure: descriptors only, no `new`, no audio-node calls.
 * These cover the routing and index arithmetic; the audio-graph side effects
 * that used to live here are covered in actions/trackListActions.test.ts.
 *
 * Reaches the reducer through the webpack aliases, which Jest can now resolve.
 */

/** Master (index 0) + two virtual-instrument tracks routed into it. */
const makeState = (): any => ({
    trackList: [
        {
            name: 'Master',
            trackType: TrackTypes.aux,
            pluginList: [],
            volume: 1.0,
            pan: 0,
            record: false,
            mute: false,
            index: 0,
            id: 0,
            output: null,
            input: [1, 2],
        },
        {
            name: 'track one',
            trackType: TrackTypes.virtualInstrument,
            pluginList: [],
            volume: 1.0,
            pan: 0,
            record: true,
            mute: false,
            solo: false,
            index: 1,
            id: 1,
            output: 0,
            input: [],
        },
        {
            name: 'track two',
            trackType: TrackTypes.virtualInstrument,
            pluginList: [],
            volume: 1.0,
            pan: 0,
            record: false,
            mute: false,
            solo: false,
            index: 2,
            id: 2,
            output: 0,
            input: [],
        },
    ],
    nextTrackId: 3,
    selected: 1,
    anyVirtualInstrumentSolo: false,
    anyAuxSolo: false,
    showAddNewTrackModal: false,
});

const trackAt = (state: any, index: number) => state.trackList.find((track: any) => track.index === index);

describe('tracksReducer', () => {
    it('returns the default state, with Master at index 0', () => {
        const state: any = reducer(undefined, { type: '@@INIT' });

        expect(state.trackList).toHaveLength(2);
        expect(state.trackList[0].name).toBe('Master');
        expect(state.trackList[0].trackType).toBe(TrackTypes.aux);
        expect(state.trackList[1].trackType).toBe(TrackTypes.virtualInstrument);
        expect(state.selected).toBe(1);
    });

    it('ships an instrument placeholder the UI can read before the context exists', () => {
        // Regression: a null placeholder crashed the first render, since the
        // channel strip and instrument panel read .id/.name/.preset directly.
        const state: any = reducer(undefined, { type: '@@INIT' });

        expect(state.trackList[1].instrument).toEqual(
            expect.objectContaining({ id: null, name: '', preset: null }),
        );
    });

    it('ignores unknown actions', () => {
        const state = makeState();

        expect(reducer(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
    });

    describe('CHANGE_TRACK_NAME', () => {
        it('renames the addressed track only', () => {
            const state: any = reducer(makeState(), {
                type: 'CHANGE_TRACK_NAME',
                payload: { index: 2, newTrackName: 'renamed' },
            });

            expect(trackAt(state, 2).name).toBe('renamed');
            expect(trackAt(state, 1).name).toBe('track one');
        });
    });

    describe('CHANGE_RECORD_STATE', () => {
        it('toggles the record arm of the addressed track', () => {
            const state: any = reducer(makeState(), { type: 'CHANGE_RECORD_STATE', payload: 2 });

            expect(trackAt(state, 2).record).toBe(true);
            expect(trackAt(state, 1).record).toBe(true);
        });
    });

    describe('CHANGE_SELECTED_TRACK', () => {
        it('moves the single armed track to the newly selected one', () => {
            const state: any = reducer(makeState(), { type: 'CHANGE_SELECTED_TRACK', payload: 2 });

            expect(state.selected).toBe(2);
            expect(trackAt(state, 2).record).toBe(true);
            expect(trackAt(state, 1).record).toBe(false);
        });

        it('keeps the other arms when more than one track is armed', () => {
            const initial = makeState();
            initial.trackList[2].record = true;

            const state: any = reducer(initial, { type: 'CHANGE_SELECTED_TRACK', payload: 2 });

            expect(trackAt(state, 1).record).toBe(true);
            expect(trackAt(state, 2).record).toBe(true);
        });

        it('never arms an aux track', () => {
            const state: any = reducer(makeState(), { type: 'CHANGE_SELECTED_TRACK', payload: 0 });

            expect(trackAt(state, 0).record).toBe(false);
            expect(state.selected).toBe(0);
        });
    });

    describe('CHANGE_TRACK_MUTE_STATE', () => {
        it('toggles mute', () => {
            const state: any = reducer(makeState(), { type: 'CHANGE_TRACK_MUTE_STATE', payload: 1 });

            expect(trackAt(state, 1).mute).toBe(true);
        });
    });

    describe('CHANGE_TRACK_SOLO_STATE', () => {
        it('raises anyVirtualInstrumentSolo', () => {
            const state: any = reducer(makeState(), { type: 'CHANGE_TRACK_SOLO_STATE', payload: 1 });

            expect(trackAt(state, 1).solo).toBe(true);
            expect(state.anyVirtualInstrumentSolo).toBe(true);
            expect(state.anyAuxSolo).toBe(false);
        });

        it('clears the flag when the last solo is switched off', () => {
            const initial = makeState();
            initial.trackList[1].solo = true;
            initial.anyVirtualInstrumentSolo = true;

            const state: any = reducer(initial, { type: 'CHANGE_TRACK_SOLO_STATE', payload: 1 });

            expect(trackAt(state, 1).solo).toBe(false);
            expect(state.anyVirtualInstrumentSolo).toBe(false);
        });
    });

    describe('CHANGE_TRACK_VOLUME / CHANGE_TRACK_PAN', () => {
        it('stores the volume', () => {
            const state: any = reducer(makeState(), {
                type: 'CHANGE_TRACK_VOLUME',
                payload: { index: 1, volume: 0.25 },
            });

            expect(trackAt(state, 1).volume).toBe(0.25);
        });

        it('stores the pan', () => {
            const state: any = reducer(makeState(), { type: 'CHANGE_TRACK_PAN', payload: { index: 2, pan: -0.5 } });

            expect(trackAt(state, 2).pan).toBe(-0.5);
        });
    });

    describe('CHANGE_TRACK_OUTPUT', () => {
        it('rewires the routing lists on both ends', () => {
            const initial = makeState();
            // Make track 2 an aux so track 1 has somewhere else to go.
            initial.trackList[2].trackType = TrackTypes.aux;

            const state: any = reducer(initial, {
                type: 'CHANGE_TRACK_OUTPUT',
                payload: { index: 1, outputIndex: 2 },
            });

            expect(trackAt(state, 1).output).toBe(2);
            expect(trackAt(state, 0).input).not.toContain(1);
            expect(trackAt(state, 2).input).toContain(1);
        });
    });

    describe('TRACK_INDEX_UP / TRACK_INDEX_DOWN', () => {
        it('swaps a track with the one above it and keeps the list sorted', () => {
            const state: any = reducer(makeState(), { type: 'TRACK_INDEX_UP', payload: 1 });

            expect(state.trackList.map((track: any) => track.index)).toEqual([0, 1, 2]);
            expect(trackAt(state, 2).name).toBe('track one');
            expect(trackAt(state, 1).name).toBe('track two');
        });

        it('swaps a track with the one below it', () => {
            const state: any = reducer(makeState(), { type: 'TRACK_INDEX_DOWN', payload: 2 });

            expect(state.trackList.map((track: any) => track.index)).toEqual([0, 1, 2]);
            expect(trackAt(state, 1).name).toBe('track two');
            expect(trackAt(state, 2).name).toBe('track one');
        });
    });

    describe('REMOVE_TRACK', () => {
        it('drops the track, reindexes the rest and unhooks it from its output', () => {
            const state: any = reducer(makeState(), { type: 'REMOVE_TRACK', payload: 1 });

            expect(state.trackList).toHaveLength(2);
            expect(state.trackList.map((track: any) => track.index)).toEqual([0, 1]);
            expect(trackAt(state, 1).name).toBe('track two');
            expect(trackAt(state, 0).input).not.toContain(2);
        });
    });

    describe('UPDATE_INSTRUMENT_PRESET', () => {
        it('keeps the descriptor preset in step with the live instrument', () => {
            const initial = makeState();
            initial.trackList[1].instrument = { id: 1, name: 'MultiOsc', preset: { gain: 0 } };

            const state: any = reducer(initial, {
                type: 'UPDATE_INSTRUMENT_PRESET',
                payload: { index: 1, preset: { gain: 0.5 } },
            });

            expect(trackAt(state, 1).instrument).toEqual({ id: 1, name: 'MultiOsc', preset: { gain: 0.5 } });
            // Descriptors are replaced, not mutated in place.
            expect(trackAt(state, 1).instrument).not.toBe(initial.trackList[1].instrument);
        });

        it('leaves tracks without an instrument alone', () => {
            const state: any = reducer(makeState(), {
                type: 'UPDATE_INSTRUMENT_PRESET',
                payload: { index: 0, preset: { gain: 1 } },
            });

            expect(trackAt(state, 0).instrument).toBeUndefined();
        });
    });

    describe('ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH', () => {
        it('toggles the modal flag', () => {
            const state: any = reducer(makeState(), { type: 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH' });

            expect(state.showAddNewTrackModal).toBe(true);
        });
    });

    describe('ADD_TRACK', () => {
        it('appends a descriptor with the id handed to it and bumps nextTrackId', () => {
            const state: any = reducer(makeState(), {
                type: 'ADD_TRACK',
                payload: { trackType: TrackTypes.aux, instrument: null, pluginList: [], id: 3 },
            });

            expect(state.trackList).toHaveLength(4);
            expect(state.trackList[3].id).toBe(3);
            expect(state.trackList[3].index).toBe(3);
            expect(state.nextTrackId).toBe(4);
            expect(trackAt(state, 0).input).toContain(3);
        });
    });

    it('keeps track ids stable when indices are renumbered', () => {
        const removed: any = reducer(makeState(), { type: 'REMOVE_TRACK', payload: 1 });

        // "track two" kept id 2 even though its index moved from 2 to 1.
        expect(trackAt(removed, 1).id).toBe(2);

        const reordered: any = reducer(makeState(), { type: 'TRACK_INDEX_UP', payload: 1 });
        expect(trackAt(reordered, 2).id).toBe(1);
        expect(trackAt(reordered, 1).id).toBe(2);
    });
});
