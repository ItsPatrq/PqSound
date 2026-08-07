import * as Utils from 'engine/Utils';
import { TrackTypes } from 'constants/Constants';

/**
 * Track descriptors only. The live Web Audio graph for each track lives in
 * engine/AudioEngine, keyed by the track's stable `id`; instruments and
 * plugins are built by the thunks in actions/trackListActions and handed to
 * this reducer already constructed. Nothing here calls `new` or touches an
 * audio node — see #156.
 */
const newMasterPluginList = [];
const newTrackPluginList = [];
// Placeholder descriptor: the real one arrives with INIT_INSTRUMENT_CONTEXT,
// but the UI renders before that and reads .id/.name/.preset off it.
const firstInstrument = { id: null, name: '', preset: null };
export default function reducer(
    state = {
        trackList: [
            {
                name: 'Master',
                trackType: TrackTypes.aux,
                pluginList: newMasterPluginList,
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
                pluginList: newTrackPluginList,
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
    action,
) {
    switch (action.type) {
        case 'ADD_TRACK': {
            const newTrackList = [...state.trackList];
            newTrackList[0].input.push(state.trackList.length);
            newTrackList.push({
                name: 'Default',
                trackType: action.payload.trackType,
                instrument: action.payload.instrument,
                pluginList: action.payload.pluginList,
                volume: 1.0,
                pan: 0,
                record: false,
                mute: false,
                solo: false,
                index: state.trackList.length,
                id: action.payload.id,
                output: 0,
                input: [],
            });
            return {
                ...state,
                trackList: newTrackList,
                nextTrackId: action.payload.id + 1,
            };
        }
        case 'REMOVE_TRACK': {
            const newTrackList = [...state.trackList];
            let selected = state.selected;
            for (let i = 1; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    selected = selected === newTrackList.length - 1 ? selected - 1 : selected;
                    const currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for (let j = 0; j < currOutput.input.length; j++) {
                        if (currOutput.input[j] === action.payload) {
                            currOutput.input.splice(j, 1);
                            break;
                        }
                    }
                    for (let j = 0; j < newTrackList[i].input.length; j++) {
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output = newTrackList[i].output;
                        currOutput.input.push(newTrackList[i].input[j]);
                    }
                    newTrackList.splice(i, 1);
                    for (let j = 0; j < newTrackList.length; j++) {
                        const currTrack = Utils.getTrackByIndex(newTrackList, newTrackList[j].index);
                        for (let k = 0; k < currTrack.input.length; k++) {
                            if (currTrack.input[k] >= i) {
                                --currTrack.input[k];
                            }
                        }
                        currTrack.output = currTrack.output >= i ? currTrack.output - 1 : currTrack.output;
                        currTrack.index = currTrack.index >= i ? currTrack.index - 1 : currTrack.index;
                    }
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                selected: selected,
            };
        }
        case 'CHANGE_RECORD_STATE': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].record = !newTrackList[i].record;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_TRACK_SOLO_STATE': {
            const newTrackList = [...state.trackList];
            let newAnyVirtualInstrumentSolo = false;
            let newAnyAuxSolo = false;
            for (let i = 1; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].solo = !newTrackList[i].solo;
                }
                if (newTrackList[i].solo) {
                    if (newTrackList[i].trackType === TrackTypes.virtualInstrument) {
                        newAnyVirtualInstrumentSolo = true;
                    } else if (newTrackList[i].trackType === TrackTypes.aux) {
                        newAnyAuxSolo = true;
                    }
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                anyVirtualInstrumentSolo: newAnyVirtualInstrumentSolo,
                anyAuxSolo: newAnyAuxSolo,
            };
        }
        case 'CHANGE_TRACK_MUTE_STATE': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].mute = !newTrackList[i].mute;
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_TRACK_NAME': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].name = action.payload.newTrackName;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_SELECTED_TRACK': {
            const newTrackList = [...state.trackList];
            let recording = 0;
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].record) {
                    recording++;
                }
            }
            if (recording === 1) {
                for (let i = 0; i < newTrackList.length; i++) {
                    if (newTrackList[i].record) {
                        newTrackList[i].record = false;
                    }
                    if (newTrackList[i].index === action.payload) {
                        newTrackList[i].record = true;
                    }
                }
            } else {
                for (let i = 0; i < newTrackList.length; i++) {
                    if (newTrackList[i].index === action.payload) {
                        newTrackList[i].record = true;
                    }
                }
            }
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].record && newTrackList[i].trackType === TrackTypes.aux) {
                    newTrackList[i].record = false;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                selected: action.payload,
            };
        }
        case 'INIT_INSTRUMENT_CONTEXT': {
            const newTrackList = [...state.trackList];
            const { index, instrument } = action.payload;
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === index) {
                    newTrackList[i].instrument = instrument;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_TRACK_VOLUME': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].volume = action.payload.volume;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_TRACK_PAN': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].pan = action.payload.pan;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_TRACK_INSTRUMENT': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].instrument = action.payload.instrument;
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'CHANGE_TRACK_OUTPUT': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    const currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for (let j = 0; j < currOutput.input.length; j++) {
                        if (currOutput.input[j] === action.payload.index) {
                            currOutput.input.splice(j, 1);
                            break;
                        }
                    }
                    newTrackList[i].output = action.payload.outputIndex;
                    Utils.getTrackByIndex(newTrackList, action.payload.outputIndex).input.push(action.payload.index);
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH': {
            return {
                ...state,
                showAddNewTrackModal: !state.showAddNewTrackModal,
            };
        }
        case 'TRACK_INDEX_UP': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    for (let j = 0; j < newTrackList[i].input.length; j++) {
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output++;
                    }
                    const currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for (let j = 0; j < currOutput.input.length; j++) {
                        if (currOutput.input[j] === newTrackList[i].index) {
                            currOutput.input[j]++;
                            break;
                        }
                    }
                    ++newTrackList[i].index;
                } else if (newTrackList[i].index === action.payload + 1) {
                    for (let j = 0; j < newTrackList[i].input.length; j++) {
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output--;
                    }
                    const currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for (let j = 0; j < currOutput.input.length; j++) {
                        if (currOutput.input[j] === newTrackList[i].index) {
                            currOutput.input[j]--;
                            break;
                        }
                    }
                    --newTrackList[i].index;
                }
            }
            newTrackList.sort((a, b) => {
                return a.index - b.index;
            });
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'TRACK_INDEX_DOWN': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    for (let j = 0; j < newTrackList[i].input.length; j++) {
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output--;
                    }
                    const currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for (let j = 0; j < currOutput.input.length; j++) {
                        if (currOutput.input[j] === newTrackList[i].index) {
                            currOutput.input[j]--;
                            break;
                        }
                    }
                    --newTrackList[i].index;
                } else if (newTrackList[i].index === action.payload - 1) {
                    for (let j = 0; j < newTrackList[i].input.length; j++) {
                        Utils.getTrackByIndex(newTrackList, newTrackList[i].input[j]).output++;
                    }
                    const currOutput = Utils.getTrackByIndex(newTrackList, newTrackList[i].output);
                    for (let j = 0; j < currOutput.input.length; j++) {
                        if (currOutput.input[j] === newTrackList[i].index) {
                            currOutput.input[j]++;
                            break;
                        }
                    }
                    ++newTrackList[i].index;
                }
            }
            newTrackList.sort((a, b) => {
                return a.index - b.index;
            });
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'ADD_NEW_PLUGIN': {
            const newTrackList = [...state.trackList];
            const currTrack = Utils.getTrackByIndex(newTrackList, action.payload.index);
            currTrack.pluginList.push(action.payload.plugin);
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'REMOVE_PLUGIN': {
            const newTrackList = [...state.trackList];
            const currTrack = Utils.getTrackByIndex(newTrackList, action.payload.index);
            for (let i = 0; i < currTrack.pluginList.length; i++) {
                if (currTrack.pluginList[i].index === action.payload.pluginIndex) {
                    currTrack.pluginList.splice(i, 1);
                    for (let j = i; j < currTrack.pluginList.length; j++) {
                        currTrack.pluginList[j].index = j;
                    }
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
            };
        }
        case 'LOAD_TRACK_STATE': {
            // The thunk has already built the instruments, plugins and track
            // graphs; this only swaps in the finished descriptors.
            return {
                ...state,
                ...action.payload,
            };
        }
        case 'UPDATE_INSTRUMENT_PRESET': {
            // The live instrument is updated by the thunk; the descriptor keeps
            // the store's copy of the preset in step for rendering and export.
            return {
                ...state,
                trackList: state.trackList.map((track) =>
                    track.index === action.payload.index && track.instrument
                        ? { ...track, instrument: { ...track.instrument, preset: action.payload.preset } }
                        : track,
                ),
            };
        }
        case 'CHANGE_PLUGIN_PRESET': {
            // Plugins are still live objects in state; the thunk mutates them
            // and this only re-renders the subscribers.
            return {
                ...state,
                trackList: [...state.trackList],
            };
        }
    }
    return state;
}
