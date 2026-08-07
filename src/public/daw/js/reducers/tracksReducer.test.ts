/**
 * @jest-environment jsdom
 */
import reducer from 'reducers/tracksReducer';
import { TrackTypes } from 'constants/Constants';

/**
 * Characterization tests for tracksReducer, written ahead of the engine/store
 * decoupling (#156) so the routing/index arithmetic and the audio-graph
 * side effects are pinned down before the live `trackNode` objects move out of
 * state. They deliberately describe today's behaviour, side effects included.
 *
 * Reaches the reducer through the webpack aliases, which Jest can now resolve.
 */

const makeTrackNode = (): any => ({
    updateSoloState: jest.fn(),
    updateMuteState: jest.fn(),
    updateTrackNode: jest.fn(),
    updateInstrument: jest.fn(),
    changeVolume: jest.fn(),
    changePan: jest.fn(),
});

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
            output: null,
            input: [1, 2],
            trackNode: makeTrackNode(),
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
            output: 0,
            input: [],
            trackNode: makeTrackNode(),
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
            output: 0,
            input: [],
            trackNode: makeTrackNode(),
        },
    ],
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
        it('toggles mute and pushes it into the audio graph', () => {
            const initial = makeState();
            const node = initial.trackList[1].trackNode;

            const state: any = reducer(initial, { type: 'CHANGE_TRACK_MUTE_STATE', payload: 1 });

            expect(trackAt(state, 1).mute).toBe(true);
            expect(node.updateMuteState).toHaveBeenCalledTimes(1);
        });
    });

    describe('CHANGE_TRACK_SOLO_STATE', () => {
        it('raises anyVirtualInstrumentSolo and tells every track about it', () => {
            const initial = makeState();
            const soloed = initial.trackList[1].trackNode;
            const other = initial.trackList[2].trackNode;

            const state: any = reducer(initial, { type: 'CHANGE_TRACK_SOLO_STATE', payload: 1 });

            expect(trackAt(state, 1).solo).toBe(true);
            expect(state.anyVirtualInstrumentSolo).toBe(true);
            expect(state.anyAuxSolo).toBe(false);
            expect(soloed.updateSoloState).toHaveBeenCalledWith(true, true);
            expect(other.updateSoloState).toHaveBeenCalledWith(false, true);
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
        it('stores the volume and forwards it to the track node', () => {
            const initial = makeState();
            const node = initial.trackList[1].trackNode;

            const state: any = reducer(initial, { type: 'CHANGE_TRACK_VOLUME', payload: { index: 1, volume: 0.25 } });

            expect(trackAt(state, 1).volume).toBe(0.25);
            expect(node.changeVolume).toHaveBeenCalledWith(0.25);
        });

        it('stores the pan and forwards it to the track node', () => {
            const initial = makeState();
            const node = initial.trackList[2].trackNode;

            const state: any = reducer(initial, { type: 'CHANGE_TRACK_PAN', payload: { index: 2, pan: -0.5 } });

            expect(trackAt(state, 2).pan).toBe(-0.5);
            expect(node.changePan).toHaveBeenCalledWith(-0.5);
        });
    });

    describe('CHANGE_TRACK_OUTPUT', () => {
        it('rewires the routing lists on both ends and the audio graph', () => {
            const initial = makeState();
            // Make track 2 an aux so track 1 has somewhere else to go.
            initial.trackList[2].trackType = TrackTypes.aux;
            const node = initial.trackList[1].trackNode;

            const state: any = reducer(initial, {
                type: 'CHANGE_TRACK_OUTPUT',
                payload: { index: 1, outputIndex: 2 },
            });

            expect(trackAt(state, 1).output).toBe(2);
            expect(trackAt(state, 0).input).not.toContain(1);
            expect(trackAt(state, 2).input).toContain(1);
            expect(node.updateTrackNode).toHaveBeenCalledWith(2);
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

    describe('UPDATE_ALL_TRACK_NODES', () => {
        it('replays mute and solo state into the audio graph', () => {
            const initial = makeState();
            initial.trackList[1].mute = true;
            initial.trackList[2].solo = true;
            initial.anyVirtualInstrumentSolo = true;
            const muted = initial.trackList[1].trackNode;
            const soloed = initial.trackList[2].trackNode;

            reducer(initial, { type: 'UPDATE_ALL_TRACK_NODES' });

            expect(muted.updateMuteState).toHaveBeenCalledTimes(1);
            expect(muted.updateSoloState).toHaveBeenCalledWith(false, true);
            expect(soloed.updateSoloState).toHaveBeenCalledWith(true, true);
        });
    });

    describe('ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH', () => {
        it('toggles the modal flag', () => {
            const state: any = reducer(makeState(), { type: 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH' });

            expect(state.showAddNewTrackModal).toBe(true);
        });
    });

    describe('ADD_TRACK', () => {
        // Regression: the reducer called `new Sampler(...)` without importing it,
        // so adding a virtual-instrument track threw a ReferenceError.
        it('constructs a Sampler for a virtual-instrument track', () => {
            const initial = makeState();
            const audioContext = {
                createGain: () => ({ connect: jest.fn(), gain: { value: 1, setValueAtTime: jest.fn() } }),
            };
            initial.trackList[0].trackNode = { ...makeTrackNode(), input: {} } as any;

            expect(() =>
                reducer(initial, {
                    type: 'ADD_TRACK',
                    payload: { trackType: TrackTypes.virtualInstrument, audioContext },
                }),
            ).not.toThrow(ReferenceError);
        });
    });
});
