import { createSlice } from '@reduxjs/toolkit';

import { TrackTypes } from 'constants/Constants';

/**
 * Track descriptors only. The live Web Audio graph for each track lives in
 * engine/AudioEngine, keyed by the track's stable `id`; instruments and
 * plugins are built by the thunks in actions/trackListActions and handed to
 * this reducer already constructed. Nothing here calls `new` or touches an
 * audio node — see #156.
 *
 * The bodies mutate Immer drafts, so the copy-on-write guarantee the store's
 * immutableCheck enforces is Immer's job now rather than hand-written copies.
 */
// Placeholder descriptor: the real one arrives with INIT_INSTRUMENT_CONTEXT,
// but the UI renders before that and reads .id/.name/.preset off it.
const firstInstrument = { id: null, name: '', preset: null };

const trackAt = (state, index) => state.trackList.find((track) => track.index === index);

/**
 * Moves the track at `movedIndex` by `movedDelta` and the one it swaps with by
 * `otherDelta`, carrying the routing with it: every child's `output` follows its
 * parent, and each parent's entry in its own output's `input` list follows its
 * new index. Shared by both reorder actions.
 */
const reorderTracks = (state, movedIndex, movedDelta, otherIndex, otherDelta) => {
    // Snapshot index/output/input before anything moves, so both tracks are
    // repositioned against the original layout.
    const moves = [
        [movedIndex, movedDelta],
        [otherIndex, otherDelta],
    ]
        .map(([index, delta]) => {
            const track = trackAt(state, index);
            return track ? { track, delta, index: track.index, output: track.output, input: [...track.input] } : null;
        })
        .filter((move) => move !== null);

    moves.forEach(({ delta, index, output, input }) => {
        input.forEach((childIndex) => {
            const child = trackAt(state, childIndex);
            if (child) {
                child.output = child.output + delta;
            }
        });
        const outputTrack = trackAt(state, output);
        if (outputTrack) {
            const position = outputTrack.input.indexOf(index);
            if (position !== -1) {
                outputTrack.input[position] = outputTrack.input[position] + delta;
            }
        }
    });
    moves.forEach(({ track, delta }) => {
        track.index = track.index + delta;
    });
    state.trackList.sort((a, b) => a.index - b.index);
};

const tracksSlice = createSlice({
    name: 'tracks',
    initialState: {
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
                output: null, //output: context.destination
                input: [1],
            },
            {
                name: 'multi-oscilator',
                trackType: TrackTypes.virtualInstrument,
                instrument: firstInstrument,
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
        ],
        // Ids are handed out from here and never reused, so the engine's track
        // registry survives the renumbering that remove/reorder does to `index`.
        nextTrackId: 2,
        selected: 1,
        anyVirtualInstrumentSolo: false,
        anyAuxSolo: false,
        showAddNewTrackModal: false,
    },
    reducers: {
        addTrack: {
            reducer(state, action) {
                const newTrackIndex = state.trackList.length;
                trackAt(state, 0).input.push(newTrackIndex);
                state.trackList.push({
                    name: 'Default',
                    trackType: action.payload.trackType,
                    instrument: action.payload.instrument,
                    pluginList: action.payload.pluginList,
                    volume: 1.0,
                    pan: 0,
                    record: false,
                    mute: false,
                    solo: false,
                    index: newTrackIndex,
                    id: action.payload.id,
                    output: 0,
                    input: [],
                });
                state.nextTrackId = action.payload.id + 1;
            },
            prepare(trackType, instrument, pluginList, id) {
                return { payload: { trackType, instrument, pluginList, id } };
            },
        },
        removeTrack(state, action) {
            // Master (position 0) is never removable.
            const position = state.trackList.findIndex((track, i) => i >= 1 && track.index === action.payload);
            if (position === -1) {
                return;
            }
            const removed = state.trackList[position];
            const removedInput = [...removed.input];
            const removedOutput = removed.output;
            if (state.selected === state.trackList.length - 1) {
                state.selected = state.selected - 1;
            }

            // Re-parent the removed track's children onto its own output.
            const outputTrack = trackAt(state, removedOutput);
            if (outputTrack) {
                outputTrack.input = outputTrack.input.filter((entry) => entry !== action.payload).concat(removedInput);
            }
            removedInput.forEach((childIndex) => {
                const child = trackAt(state, childIndex);
                if (child) {
                    child.output = removedOutput;
                }
            });

            // Drop it and close the gap its index left behind.
            state.trackList.splice(position, 1);
            state.trackList.forEach((track) => {
                track.input = track.input.map((entry) => (entry >= position ? entry - 1 : entry));
                if (track.output >= position) {
                    track.output = track.output - 1;
                }
                if (track.index >= position) {
                    track.index = track.index - 1;
                }
            });
        },
        changeRecordState(state, action) {
            const track = trackAt(state, action.payload);
            if (track) {
                track.record = !track.record;
            }
        },
        changeSoloState(state, action) {
            // Master (position 0) has no solo of its own.
            state.trackList.forEach((track, i) => {
                if (i >= 1 && track.index === action.payload) {
                    track.solo = !track.solo;
                }
            });
            state.anyVirtualInstrumentSolo = false;
            state.anyAuxSolo = false;
            state.trackList.slice(1).forEach((track) => {
                if (!track.solo) {
                    return;
                }
                if (track.trackType === TrackTypes.virtualInstrument) {
                    state.anyVirtualInstrumentSolo = true;
                } else if (track.trackType === TrackTypes.aux) {
                    state.anyAuxSolo = true;
                }
            });
        },
        changeMuteState(state, action) {
            const track = trackAt(state, action.payload);
            if (track) {
                track.mute = !track.mute;
            }
        },
        changeTrackName: {
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track) {
                    track.name = action.payload.newTrackName;
                }
            },
            prepare(newName, newIndex) {
                return { payload: { index: newIndex, newTrackName: newName } };
            },
        },
        changeSelectedTrack(state, action) {
            // With exactly one track armed, selecting moves the arm; with
            // several, selecting only adds one. Aux tracks are never armed.
            const armedCount = state.trackList.filter((track) => track.record).length;
            state.trackList.forEach((track) => {
                if (armedCount === 1 && track.record) {
                    track.record = false;
                }
                if (track.index === action.payload) {
                    track.record = true;
                }
                if (track.record && track.trackType === TrackTypes.aux) {
                    track.record = false;
                }
            });
            state.selected = action.payload;
        },
        initInstrumentContext: {
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track) {
                    track.instrument = action.payload.instrument;
                }
            },
            prepare(index, instrument) {
                return { payload: { index, instrument } };
            },
        },
        changeTrackVolume: {
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track) {
                    track.volume = action.payload.volume;
                }
            },
            prepare(newIndex, newVolume) {
                return { payload: { index: newIndex, volume: newVolume } };
            },
        },
        changeTrackPan: {
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track) {
                    track.pan = action.payload.pan;
                }
            },
            prepare(newIndex, newPan) {
                return { payload: { index: newIndex, pan: newPan } };
            },
        },
        changeTrackInstrument: {
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track) {
                    track.instrument = action.payload.instrument;
                }
            },
            prepare(index, instrument) {
                return { payload: { index, instrument } };
            },
        },
        changeTrackOutput: {
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (!track) {
                    return;
                }
                const previousOutput = trackAt(state, track.output);
                if (previousOutput) {
                    previousOutput.input = previousOutput.input.filter((entry) => entry !== action.payload.index);
                }
                track.output = action.payload.outputIndex;
                const nextOutput = trackAt(state, action.payload.outputIndex);
                if (nextOutput) {
                    nextOutput.input.push(action.payload.index);
                }
            },
            prepare(newIndex, newOutputIndex) {
                return { payload: { index: newIndex, outputIndex: newOutputIndex } };
            },
        },
        addNewTrackModalVisibilitySwitch(state) {
            state.showAddNewTrackModal = !state.showAddNewTrackModal;
        },
        trackIndexUp(state, action) {
            reorderTracks(state, action.payload, 1, action.payload + 1, -1);
        },
        trackIndexDown(state, action) {
            reorderTracks(state, action.payload, -1, action.payload - 1, 1);
        },
        setTrackPlugins: {
            // The engine owns the live chain and hands over the whole
            // descriptor list after every add/remove.
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track) {
                    track.pluginList = action.payload.pluginList;
                }
            },
            prepare(index, pluginList) {
                return { payload: { index, pluginList } };
            },
        },
        loadTrackState(state, action) {
            // The thunk has already built the instruments, plugins and track
            // graphs; this only swaps in the finished descriptors.
            return { ...state, ...action.payload };
        },
        updateInstrumentPreset: {
            // The live instrument is updated by the thunk; the descriptor keeps
            // the store's copy of the preset in step for rendering and export.
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                if (track && track.instrument) {
                    track.instrument.preset = action.payload.preset;
                }
            },
            prepare(newPreset, newTrackIndex) {
                return { payload: { index: newTrackIndex, preset: newPreset } };
            },
        },
        changePluginPreset: {
            // The live plugin is updated by the thunk; the descriptor keeps the
            // store's copy of the preset in step for rendering and export.
            reducer(state, action) {
                const track = trackAt(state, action.payload.index);
                const plugin = track
                    ? track.pluginList.find((curr) => curr.index === action.payload.pluginIndex)
                    : undefined;
                if (plugin) {
                    plugin.preset = action.payload.preset;
                }
            },
            prepare(newTrackIndex, newPluginIndex, newPreset) {
                return { payload: { index: newTrackIndex, pluginIndex: newPluginIndex, preset: newPreset } };
            },
        },
    },
});

export const {
    addTrack,
    removeTrack,
    changeRecordState,
    changeSoloState,
    changeMuteState,
    changeTrackName,
    changeSelectedTrack,
    initInstrumentContext,
    changeTrackVolume,
    changeTrackPan,
    changeTrackInstrument,
    changeTrackOutput,
    addNewTrackModalVisibilitySwitch,
    trackIndexUp,
    trackIndexDown,
    setTrackPlugins,
    loadTrackState,
    updateInstrumentPreset,
    changePluginPreset,
} = tracksSlice.actions;

export default tracksSlice.reducer;
