/**
 * @jest-environment jsdom
 */
import AudioEngine from 'engine/AudioEngine';
import TrackMock from 'engine/Track';
import * as actions from 'actions/trackListActions';
import { TrackTypes } from 'constants/Constants';
import * as slice from 'slices/tracksSlice';

/**
 * The audio-graph side effects that used to sit inside tracksSlice now live
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

            expect(dispatch).toHaveBeenCalledWith(slice.changeTrackVolume(2, 0.25));
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

            expect(dispatch).toHaveBeenCalledWith(slice.changeMuteState(1));
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
                    type: slice.addTrack.type,
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

            expect(dispatch).toHaveBeenCalledWith(slice.removeTrack(2));
            expect(engine.removeTrackNode).toHaveBeenCalledWith(9);
            expect(engine.removeInstrument).toHaveBeenCalledWith(9);
            expect(engine.removePlugins).toHaveBeenCalledWith(9);
        });
    });

    describe('changeTrackInstrument', () => {
        it('registers the live instrument and dispatches only its descriptor', () => {
            const { dispatch } = run(actions.changeTrackInstrument(3, 1));

            const dispatched = dispatch.mock.calls[0][0];
            expect(dispatched.type).toBe(slice.changeTrackInstrument.type);
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
            expect(dispatch).toHaveBeenCalledWith(
                slice.setTrackPlugins(1, [{ id: 4, name: 'Equalizer', index: 0, preset: { gain: 0 } }]),
            );
        });

        it('removes through the engine so the live array the node holds is the one mutated', () => {
            engine.getPlugins.mockReturnValue([]);

            const { dispatch } = run(actions.removePlugin(2, 0));

            expect(engine.removePlugin).toHaveBeenCalledWith(9, 0);
            expect(engine.refreshTrackNode).toHaveBeenCalledWith(9);
            expect(dispatch).toHaveBeenCalledWith(slice.setTrackPlugins(2, []));
        });
    });

    describe('changePluginPreset', () => {
        it('updates the plugin the engine holds, then dispatches the preset', () => {
            const { dispatch } = run(actions.changePluginPreset(1, 0, { gain: 3 }));

            expect(engine.updatePluginPreset).toHaveBeenCalledWith(7, 0, { gain: 3 });
            expect(dispatch).toHaveBeenCalledWith(slice.changePluginPreset(1, 0, { gain: 3 }));
        });
    });

    describe('updateInstrumentPreset', () => {
        it('updates the instrument held by the engine, not one in state', () => {
            const live = { updatePreset: jest.fn() };
            engine.getInstrument.mockReturnValue(live);

            const { dispatch } = run(actions.updateInstrumentPreset({ gain: 1 }, 1));

            expect(engine.getInstrument).toHaveBeenCalledWith(7);
            expect(live.updatePreset).toHaveBeenCalledWith({ gain: 1 });
            expect(dispatch).toHaveBeenCalledWith(slice.updateInstrumentPreset({ gain: 1 }, 1));
        });
    });

    /**
     * #253: loadTrackState rebuilds tracks in ascending index order and hands
     * out fresh ids as it goes, so a track routed to a destination at a *higher*
     * index resolved that destination through an id the file supplied and the
     * engine no longer knows. That returned undefined — and Track treats an
     * absent destination as "connect to context.destination", so the track
     * bypassed both the aux bus and master. Worse, a stale file id can collide
     * with an id already handed to a different track, which routes the audio
     * into the wrong bus instead.
     */
    describe('loadTrackState routing', () => {
        /** Master, an instrument track routed to the aux, and the aux above it. */
        const stateWithForwardRoute = (): any => ({
            trackList: [
                {
                    name: 'Master',
                    trackType: TrackTypes.aux,
                    index: 0,
                    id: 3,
                    output: null,
                    input: [1],
                    pluginList: [],
                },
                {
                    name: 'lead',
                    trackType: TrackTypes.virtualInstrument,
                    index: 1,
                    id: 4,
                    // Routed to the aux at index 2 — the forward reference.
                    output: 2,
                    input: [],
                    pluginList: [],
                    instrument: { id: 1, name: 'MultiOsc', preset: {} },
                },
                {
                    name: 'reverb bus',
                    trackType: TrackTypes.aux,
                    index: 2,
                    id: 5,
                    output: 0,
                    input: [1],
                    pluginList: [],
                },
            ],
            nextTrackId: 6,
            selected: 1,
            anyVirtualInstrumentSolo: false,
            anyAuxSolo: false,
        });

        /** Track doubles with distinguishable inputs, wired into the engine registry. */
        const trackRegistry = () => {
            const nodes: Record<number, any> = {};
            let created = 0;
            engine.setTrackNode.mockImplementation((id: number, node: any) => {
                nodes[id] = node;
            });
            engine.getTrackNode.mockImplementation((id: number) => nodes[id]);
            engine.refreshTrackNode.mockImplementation((id: number, destination: any) => {
                if (nodes[id]) {
                    nodes[id].updateTrackNode(destination);
                }
            });
            (TrackMock as unknown as jest.Mock).mockImplementation(
                (pluginList: any, instrument: any, destination: any) => {
                    const node: any = {
                        input: `input-${created++}`,
                        destination,
                        pluginNodeList: pluginList,
                        updateTrackNode: jest.fn((next: any) => {
                            if (next !== undefined) {
                                node.destination = next;
                            }
                        }),
                    };
                    return node;
                },
            );
            return nodes;
        };

        it('connects a track to an aux that sits above it in the list', () => {
            const nodes = trackRegistry();
            // Master already has a live node before a load, as in the real app.
            const master = { input: 'master-input', pluginNodeList: [], updateTrackNode: jest.fn() };
            engine.setTrackNode(3, master);

            const loaded = stateWithForwardRoute();
            run(actions.loadTrackState(loaded), loaded);

            // Ids are handed out from master's id upward: lead=4, aux=5.
            const lead = nodes[4];
            const aux = nodes[5];
            expect(aux).toBeDefined();
            // The whole point: the lead must feed the aux's input, not fall
            // through to context.destination and not land on another bus.
            expect(lead.destination).toBe(aux.input);
        });

        it('still routes a track to master when that is where it points', () => {
            const nodes = trackRegistry();
            const master = { input: 'master-input', pluginNodeList: [], updateTrackNode: jest.fn() };
            engine.setTrackNode(3, master);

            const loaded = stateWithForwardRoute();
            run(actions.loadTrackState(loaded), loaded);

            expect(nodes[5].destination).toBe('master-input');
        });
    });
});
