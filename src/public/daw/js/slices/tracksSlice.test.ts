/**
 * @jest-environment jsdom
 */
import reducer, {
    addTrack,
    removeTrack,
    changeRecordState,
    changeSoloState,
    changeMuteState,
    changeTrackName,
    changeSelectedTrack,
    changeTrackVolume,
    changeTrackPan,
    changeTrackOutput,
    addNewTrackModalVisibilitySwitch,
    trackIndexUp,
    trackIndexDown,
    setTrackPlugins,
    updateInstrumentPreset,
    changePluginPreset,
} from 'slices/tracksSlice';
import { TrackTypes } from 'constants/Constants';

/**
 * tracksSlice is now pure: descriptors only, no `new`, no audio-node calls.
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

describe('tracksSlice', () => {
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

        expect(state.trackList[1].instrument).toEqual(expect.objectContaining({ id: null, name: '', preset: null }));
    });

    it('ignores unknown actions', () => {
        const state = makeState();

        expect(reducer(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
    });

    describe('changeTrackName', () => {
        it('renames the addressed track only', () => {
            const state: any = reducer(makeState(), changeTrackName('renamed', 2));

            expect(trackAt(state, 2).name).toBe('renamed');
            expect(trackAt(state, 1).name).toBe('track one');
        });
    });

    describe('changeRecordState', () => {
        it('toggles the record arm of the addressed track', () => {
            const state: any = reducer(makeState(), changeRecordState(2));

            expect(trackAt(state, 2).record).toBe(true);
            expect(trackAt(state, 1).record).toBe(true);
        });
    });

    describe('changeSelectedTrack', () => {
        it('moves the single armed track to the newly selected one', () => {
            const state: any = reducer(makeState(), changeSelectedTrack(2));

            expect(state.selected).toBe(2);
            expect(trackAt(state, 2).record).toBe(true);
            expect(trackAt(state, 1).record).toBe(false);
        });

        it('keeps the other arms when more than one track is armed', () => {
            const initial = makeState();
            initial.trackList[2].record = true;

            const state: any = reducer(initial, changeSelectedTrack(2));

            expect(trackAt(state, 1).record).toBe(true);
            expect(trackAt(state, 2).record).toBe(true);
        });

        it('never arms an aux track', () => {
            const state: any = reducer(makeState(), changeSelectedTrack(0));

            expect(trackAt(state, 0).record).toBe(false);
            expect(state.selected).toBe(0);
        });
    });

    describe('changeMuteState', () => {
        it('toggles mute', () => {
            const state: any = reducer(makeState(), changeMuteState(1));

            expect(trackAt(state, 1).mute).toBe(true);
        });
    });

    describe('changeSoloState', () => {
        it('raises anyVirtualInstrumentSolo', () => {
            const state: any = reducer(makeState(), changeSoloState(1));

            expect(trackAt(state, 1).solo).toBe(true);
            expect(state.anyVirtualInstrumentSolo).toBe(true);
            expect(state.anyAuxSolo).toBe(false);
        });

        it('clears the flag when the last solo is switched off', () => {
            const initial = makeState();
            initial.trackList[1].solo = true;
            initial.anyVirtualInstrumentSolo = true;

            const state: any = reducer(initial, changeSoloState(1));

            expect(trackAt(state, 1).solo).toBe(false);
            expect(state.anyVirtualInstrumentSolo).toBe(false);
        });
    });

    describe('changeTrackVolume / changeTrackPan', () => {
        it('stores the volume', () => {
            const state: any = reducer(makeState(), changeTrackVolume(1, 0.25));

            expect(trackAt(state, 1).volume).toBe(0.25);
        });

        it('stores the pan', () => {
            const state: any = reducer(makeState(), changeTrackPan(2, -0.5));

            expect(trackAt(state, 2).pan).toBe(-0.5);
        });
    });

    describe('changeTrackOutput', () => {
        it('rewires the routing lists on both ends', () => {
            const initial = makeState();
            // Make track 2 an aux so track 1 has somewhere else to go.
            initial.trackList[2].trackType = TrackTypes.aux;

            const state: any = reducer(initial, changeTrackOutput(1, 2));

            expect(trackAt(state, 1).output).toBe(2);
            expect(trackAt(state, 0).input).not.toContain(1);
            expect(trackAt(state, 2).input).toContain(1);
        });
    });

    describe('trackIndexUp / trackIndexDown', () => {
        it('swaps a track with the one above it and keeps the list sorted', () => {
            const state: any = reducer(makeState(), trackIndexUp(1));

            expect(state.trackList.map((track: any) => track.index)).toEqual([0, 1, 2]);
            expect(trackAt(state, 2).name).toBe('track one');
            expect(trackAt(state, 1).name).toBe('track two');
        });

        it('swaps a track with the one below it', () => {
            const state: any = reducer(makeState(), trackIndexDown(2));

            expect(state.trackList.map((track: any) => track.index)).toEqual([0, 1, 2]);
            expect(trackAt(state, 1).name).toBe('track two');
            expect(trackAt(state, 2).name).toBe('track one');
        });
    });

    describe('removeTrack', () => {
        it('drops the track, reindexes the rest and unhooks it from its output', () => {
            const state: any = reducer(makeState(), removeTrack(1));

            expect(state.trackList).toHaveLength(2);
            expect(state.trackList.map((track: any) => track.index)).toEqual([0, 1]);
            expect(trackAt(state, 1).name).toBe('track two');
            expect(trackAt(state, 0).input).not.toContain(2);
        });
    });

    describe('updateInstrumentPreset', () => {
        it('keeps the descriptor preset in step with the live instrument', () => {
            const initial = makeState();
            initial.trackList[1].instrument = { id: 1, name: 'MultiOsc', preset: { gain: 0 } };

            const state: any = reducer(initial, updateInstrumentPreset({ gain: 0.5 }, 1));

            expect(trackAt(state, 1).instrument).toEqual({ id: 1, name: 'MultiOsc', preset: { gain: 0.5 } });
            // Descriptors are replaced, not mutated in place.
            expect(trackAt(state, 1).instrument).not.toBe(initial.trackList[1].instrument);
        });

        it('leaves tracks without an instrument alone', () => {
            const state: any = reducer(makeState(), updateInstrumentPreset({ gain: 1 }, 0));

            expect(trackAt(state, 0).instrument).toBeUndefined();
        });
    });

    describe('setTrackPlugins', () => {
        it("replaces the addressed track's descriptor list", () => {
            const pluginList = [{ id: 4, name: 'Equalizer', index: 0, preset: {} }];

            const state: any = reducer(makeState(), setTrackPlugins(1, pluginList));

            expect(trackAt(state, 1).pluginList).toBe(pluginList);
            expect(trackAt(state, 2).pluginList).toEqual([]);
        });
    });

    describe('changePluginPreset', () => {
        it('updates the descriptor preset of one plugin, replacing rather than mutating', () => {
            const initial = makeState();
            initial.trackList[1].pluginList = [
                { id: 4, name: 'Equalizer', index: 0, preset: { lowFilterGain: 0 } },
                { id: 0, name: 'Compressor', index: 1, preset: { ratio: 20 } },
            ];

            const state: any = reducer(initial, changePluginPreset(1, 0, { lowFilterGain: 6 }));

            expect(trackAt(state, 1).pluginList[0].preset).toEqual({ lowFilterGain: 6 });
            expect(trackAt(state, 1).pluginList[1].preset).toEqual({ ratio: 20 });
            expect(trackAt(state, 1).pluginList[0]).not.toBe(initial.trackList[1].pluginList[0]);
        });
    });

    describe('addNewTrackModalVisibilitySwitch', () => {
        it('toggles the modal flag', () => {
            const state: any = reducer(makeState(), addNewTrackModalVisibilitySwitch(undefined));

            expect(state.showAddNewTrackModal).toBe(true);
        });
    });

    describe('addTrack', () => {
        it('appends a descriptor with the id handed to it and bumps nextTrackId', () => {
            const state: any = reducer(makeState(), addTrack(TrackTypes.aux, null, [], 3));

            expect(state.trackList).toHaveLength(4);
            expect(state.trackList[3].id).toBe(3);
            expect(state.trackList[3].index).toBe(3);
            expect(state.nextTrackId).toBe(4);
            expect(trackAt(state, 0).input).toContain(3);
        });
    });

    it('keeps track ids stable when indices are renumbered', () => {
        const removed: any = reducer(makeState(), removeTrack(1));

        // "track two" kept id 2 even though its index moved from 2 to 1.
        expect(trackAt(removed, 1).id).toBe(2);

        const reordered: any = reducer(makeState(), trackIndexUp(1));
        expect(trackAt(reordered, 2).id).toBe(1);
        expect(trackAt(reordered, 1).id).toBe(2);
    });
});
