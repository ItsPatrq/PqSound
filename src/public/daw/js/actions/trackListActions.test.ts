/**
 * @jest-environment jsdom
 */
import AudioEngine from 'engine/AudioEngine';
import * as actions from 'actions/trackListActions';
import { TrackTypes } from 'constants/Constants';

/**
 * The audio-graph side effects that used to sit inside tracksReducer now live
 * in these thunks (#156). Track graphs are addressed by the track's stable
 * `id`, never by its index — these tests are what pins that down.
 */

jest.mock('engine/AudioEngine', () => ({
    __esModule: true,
    default: {
        getContext: jest.fn(() => ({})),
        setTrackNode: jest.fn(),
        getTrackNode: jest.fn(),
        removeTrackNode: jest.fn(),
        clearTrackNodes: jest.fn(),
        applyTrackVolume: jest.fn(),
        applyTrackPan: jest.fn(),
        applyTrackMute: jest.fn(),
        applyTrackSolo: jest.fn(),
        applyTrackInstrument: jest.fn(),
        setInstrument: jest.fn(),
        getInstrument: jest.fn(),
        removeInstrument: jest.fn(),
        clearInstruments: jest.fn(),
        setPlugins: jest.fn((trackId: number, plugins: any[]) => plugins),
        getPlugins: jest.fn(() => []),
        addPlugin: jest.fn(),
        removePlugin: jest.fn(),
        removePlugins: jest.fn(),
        clearPlugins: jest.fn(),
        updatePluginPreset: jest.fn(),
        refreshTrackNode: jest.fn(),
    },
}));

// Constructing real instruments/plugins/tracks needs a live AudioContext.
jest.mock('engine/Track', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ input: 'track-input', updateTrackNode: jest.fn() })),
}));
jest.mock('instruments', () => ({
    __esModule: true,
    MultiOsc: jest.fn().mockImplementation(() => ({ id: 1, name: 'MultiOsc', preset: {} })),
    Sampler: jest.fn().mockImplementation(() => ({ id: 0, name: 'Sampler', preset: {} })),
    Utils: {
        getNewInstrumentByIndex: jest.fn(() => ({
            id: 5,
            name: 'PqSynth',
            preset: { gain: 0 },
            updatePreset: jest.fn(),
        })),
    },
}));
jest.mock('plugins', () => ({
    __esModule: true,
    Utils: { getNewPluginByIndex: jest.fn((id, index) => ({ id, index, updatePreset: jest.fn() })) },
}));

const engine = AudioEngine as unknown as Record<string, jest.Mock>;

/** Master (id 0) + two virtual-instrument tracks whose ids are offset from their indices. */
const makeTracksState = (): any => ({
    trackList: [
        { name: 'Master', trackType: TrackTypes.aux, index: 0, id: 0, output: null, input: [1, 2], pluginList: [] },
        {
            name: 'one',
            trackType: TrackTypes.virtualInstrument,
            index: 1,
            id: 7,
            output: 0,
            input: [],
            pluginList: [],
            solo: false,
            mute: false,
            instrument: { id: 1, name: 'MultiOsc', preset: {} },
        },
        {
            name: 'two',
            trackType: TrackTypes.virtualInstrument,
            index: 2,
            id: 9,
            output: 0,
            input: [],
            pluginList: [],
            solo: false,
            mute: false,
            instrument: { id: 1, name: 'MultiOsc', preset: {} },
        },
    ],
    nextTrackId: 10,
    selected: 1,
    anyVirtualInstrumentSolo: false,
    anyAuxSolo: false,
});

const run = (thunk: any, tracks: any = makeTracksState()) => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({ tracks }));
    thunk(dispatch, getState);
    return { dispatch, getState, tracks };
};

describe('trackListActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        engine.getContext.mockReturnValue({});
        engine.getTrackNode.mockReturnValue({ input: 'master-input' });
    });

    describe('changeTrackVolume / changeTrackPan', () => {
        it('addresses the engine by track id, not index', () => {
            const { dispatch } = run(actions.changeTrackVolume(2, 0.25));

            expect(dispatch).toHaveBeenCalledWith({
                type: 'CHANGE_TRACK_VOLUME',
                payload: { index: 2, volume: 0.25 },
            });
            expect(engine.applyTrackVolume).toHaveBeenCalledWith(9, 0.25);
        });

        it('forwards pan the same way', () => {
            run(actions.changeTrackPan(1, -30));

            expect(engine.applyTrackPan).toHaveBeenCalledWith(7, -30);
        });
    });

    describe('changeMuteState', () => {
        it('dispatches then mutes the addressed track node', () => {
            const { dispatch } = run(actions.changeMuteState(1));

            expect(dispatch).toHaveBeenCalledWith({ type: 'CHANGE_TRACK_MUTE_STATE', payload: 1 });
            expect(engine.applyTrackMute).toHaveBeenCalledWith(7);
        });
    });

    describe('changeSoloState', () => {
        it('replays solo state for every non-master track', () => {
            const tracks = makeTracksState();
            tracks.trackList[1].solo = true;
            tracks.anyVirtualInstrumentSolo = true;

            run(actions.changeSoloState(1), tracks);

            expect(engine.applyTrackSolo).toHaveBeenCalledWith(7, true, true);
            expect(engine.applyTrackSolo).toHaveBeenCalledWith(9, false, true);
        });

        it('mutes virtual instruments routed to master while an aux is soloed', () => {
            const tracks = makeTracksState();
            tracks.anyAuxSolo = true;

            run(actions.changeSoloState(1), tracks);

            expect(engine.applyTrackSolo).toHaveBeenCalledWith(7, false, true);
        });
    });

    describe('updateAllTrackNodes', () => {
        it('replays mute as well as solo', () => {
            const tracks = makeTracksState();
            tracks.trackList[2].mute = true;

            run(actions.updateAllTrackNodes(), tracks);

            expect(engine.applyTrackMute).toHaveBeenCalledWith(9);
            expect(engine.applyTrackMute).toHaveBeenCalledTimes(1);
            expect(engine.applyTrackSolo).toHaveBeenCalledWith(9, false, false);
        });
    });

    describe('changeTrackOutput', () => {
        it('re-points the node at the destination input node, not the index', () => {
            engine.getTrackNode.mockReturnValue({ input: 'aux-input' });

            run(actions.changeTrackOutput(1, 2));

            expect(engine.refreshTrackNode).toHaveBeenCalledWith(7, 'aux-input');
        });
    });

    describe('addTrack', () => {
        it('registers a graph under the next id and dispatches the descriptor', () => {
            const { dispatch } = run(actions.addTrack(TrackTypes.virtualInstrument));

            expect(engine.setTrackNode).toHaveBeenCalledWith(10, expect.anything());
            expect(engine.setInstrument).toHaveBeenCalledWith(10, expect.objectContaining({ name: 'Sampler' }));
            expect(engine.setPlugins).toHaveBeenCalledWith(10, []);
            // The store gets the serializable descriptor, not the live object.
            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'ADD_TRACK',
                    payload: expect.objectContaining({
                        id: 10,
                        trackType: TrackTypes.virtualInstrument,
                        instrument: { id: 0, name: 'Sampler', preset: {} },
                    }),
                }),
            );
            expect(engine.applyTrackSolo).toHaveBeenCalledWith(10, false, false);
        });
    });

    describe('removeTrack', () => {
        it('resolves the id before the reducer renumbers, then drops the graph', () => {
            const { dispatch } = run(actions.removeTrack(2));

            expect(dispatch).toHaveBeenCalledWith({ type: 'REMOVE_TRACK', payload: 2 });
            expect(engine.removeTrackNode).toHaveBeenCalledWith(9);
            expect(engine.removeInstrument).toHaveBeenCalledWith(9);
            expect(engine.removePlugins).toHaveBeenCalledWith(9);
        });
    });

    describe('changeTrackInstrument', () => {
        it('registers the live instrument and dispatches only its descriptor', () => {
            const { dispatch } = run(actions.changeTrackInstrument(3, 1));

            const dispatched = dispatch.mock.calls[0][0];
            expect(dispatched.type).toBe('CHANGE_TRACK_INSTRUMENT');
            expect(dispatched.payload.instrument).toEqual({ id: 5, name: 'PqSynth', preset: { gain: 0 } });
            expect(dispatched.payload.instrument.updatePreset).toBeUndefined();

            const live = engine.setInstrument.mock.calls[0][1];
            expect(engine.setInstrument).toHaveBeenCalledWith(7, live);
            expect(engine.applyTrackInstrument).toHaveBeenCalledWith(7, live);
        });
    });

    describe('addNewPlugin / removePlugin', () => {
        it('hands the plugin to the engine, rebuilds the chain, then dispatches descriptors', () => {
            engine.getPlugins.mockReturnValue([{ id: 4, name: 'Equalizer', index: 0, preset: { gain: 0 } }]);

            const { dispatch } = run(actions.addNewPlugin(1, 4));

            expect(engine.addPlugin).toHaveBeenCalledWith(7, expect.objectContaining({ id: 4 }));
            expect(engine.refreshTrackNode).toHaveBeenCalledWith(7);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'SET_TRACK_PLUGINS',
                payload: {
                    index: 1,
                    pluginList: [{ id: 4, name: 'Equalizer', index: 0, preset: { gain: 0 } }],
                },
            });
        });

        it('removes through the engine so the live array the node holds is the one mutated', () => {
            engine.getPlugins.mockReturnValue([]);

            const { dispatch } = run(actions.removePlugin(2, 0));

            expect(engine.removePlugin).toHaveBeenCalledWith(9, 0);
            expect(engine.refreshTrackNode).toHaveBeenCalledWith(9);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'SET_TRACK_PLUGINS',
                payload: { index: 2, pluginList: [] },
            });
        });
    });

    describe('changePluginPreset', () => {
        it('updates the plugin the engine holds, then dispatches the preset', () => {
            const { dispatch } = run(actions.changePluginPreset(1, 0, { gain: 3 }));

            expect(engine.updatePluginPreset).toHaveBeenCalledWith(7, 0, { gain: 3 });
            expect(dispatch).toHaveBeenCalledWith({
                type: 'CHANGE_PLUGIN_PRESET',
                payload: { index: 1, pluginIndex: 0, preset: { gain: 3 } },
            });
        });
    });

    describe('updateInstrumentPreset', () => {
        it('updates the instrument held by the engine, not one in state', () => {
            const live = { updatePreset: jest.fn() };
            engine.getInstrument.mockReturnValue(live);

            const { dispatch } = run(actions.updateInstrumentPreset({ gain: 1 }, 1));

            expect(engine.getInstrument).toHaveBeenCalledWith(7);
            expect(live.updatePreset).toHaveBeenCalledWith({ gain: 1 });
            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_INSTRUMENT_PRESET',
                payload: { index: 1, preset: { gain: 1 } },
            });
        });
    });
});
