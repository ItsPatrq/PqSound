import AudioEngine from 'engine/AudioEngine';
import Track from 'engine/Track';
import * as Utils from 'engine/Utils';
import { MultiOsc, Sampler, Utils as InstrumentsUtils } from 'instruments';
import { Utils as PluginsUtils } from 'plugins';
import { TrackTypes } from 'constants/Constants';
import { Utils as SamplerPresetsUtils, Presets as SamplerPresets } from 'constants/SamplerPresets';

/**
 * Track thunks. Everything that constructs or mutates a Web Audio node happens
 * here; `tracksReducer` only moves descriptors around. Track graphs are keyed
 * in AudioEngine by the track's stable `id` (see #156).
 */

/**
 * The serializable half of an instrument. The live object stays in
 * AudioEngine; the store only carries what the UI renders.
 */
const describeInstrument = (instrument) =>
    instrument ? { id: instrument.id, name: instrument.name, preset: instrument.preset } : null;

/** The serializable half of a plugin chain. */
const describePlugins = (plugins) =>
    plugins.map((plugin) => ({ id: plugin.id, name: plugin.name, index: plugin.index, preset: plugin.preset }));

const trackIdByIndex = (trackList, index) => {
    const track = Utils.getTrackByIndex(trackList, index);
    return track ? track.id : undefined;
};

/** The input node a track routed to `outputIndex` should feed. */
const destinationInput = (trackList, outputIndex) => {
    const destinationId = trackIdByIndex(trackList, outputIndex);
    const destinationNode = destinationId === undefined ? undefined : AudioEngine.getTrackNode(destinationId);
    return destinationNode ? destinationNode.input : undefined;
};

/**
 * Replays mute/solo into the audio graph. `CHANGE_TRACK_SOLO_STATE` only needs
 * the solo pass; a full state load also has to re-apply mutes.
 */
const applyTrackStates = (tracksState, { replayMute = false } = {}) => {
    const { trackList, anyVirtualInstrumentSolo, anyAuxSolo } = tracksState;
    for (let i = replayMute ? 0 : 1; i < trackList.length; i++) {
        const track = trackList[i];
        if (replayMute && track.mute) {
            AudioEngine.applyTrackMute(track.id);
        }
        if (track.trackType === TrackTypes.virtualInstrument) {
            if (anyAuxSolo && track.output === 0) {
                AudioEngine.applyTrackSolo(track.id, false, true);
            } else {
                AudioEngine.applyTrackSolo(track.id, track.solo, anyVirtualInstrumentSolo);
            }
        } else if (track.trackType === TrackTypes.aux) {
            AudioEngine.applyTrackSolo(track.id, track.solo, anyAuxSolo);
        }
    }
};

export function addTrack(newTrackType) {
    return function (dispatch, getState) {
        const audioContext = AudioEngine.getContext();
        const { trackList, nextTrackId } = getState().tracks;
        const instrument =
            newTrackType === TrackTypes.virtualInstrument
                ? new Sampler(SamplerPresetsUtils.getPresetById(SamplerPresets.DSKGrandPiano.id), audioContext)
                : null;
        const plugins = AudioEngine.setPlugins(nextTrackId, []);
        AudioEngine.setTrackNode(
            nextTrackId,
            new Track(plugins, instrument, destinationInput(trackList, 0), audioContext, 1.0, 0),
        );
        AudioEngine.setInstrument(nextTrackId, instrument);
        dispatch({
            type: 'ADD_TRACK',
            payload: {
                trackType: newTrackType,
                instrument: describeInstrument(instrument),
                pluginList: describePlugins(plugins),
                id: nextTrackId,
            },
        });
        const { anyVirtualInstrumentSolo, anyAuxSolo } = getState().tracks;
        if (newTrackType === TrackTypes.virtualInstrument) {
            AudioEngine.applyTrackSolo(nextTrackId, false, anyAuxSolo ? true : anyVirtualInstrumentSolo);
        } else if (newTrackType === TrackTypes.aux) {
            AudioEngine.applyTrackSolo(nextTrackId, false, anyAuxSolo);
        }
    };
}

export function removeTrack(index) {
    return function (dispatch, getState) {
        // Resolve the id before the reducer renumbers the remaining tracks.
        const removedId = trackIdByIndex(getState().tracks.trackList, index);
        dispatch({
            type: 'REMOVE_TRACK',
            payload: index,
        });
        if (removedId !== undefined) {
            AudioEngine.removeTrackNode(removedId);
            AudioEngine.removeInstrument(removedId);
            AudioEngine.removePlugins(removedId);
        }
    };
}

export function changeRecordState(index) {
    return {
        type: 'CHANGE_RECORD_STATE',
        payload: index,
    };
}

export function changeTrackName(newName, newIndex) {
    return {
        type: 'CHANGE_TRACK_NAME',
        payload: {
            index: newIndex,
            newTrackName: newName,
        },
    };
}

export function changeSelectedTrack(newIndex) {
    return {
        type: 'CHANGE_SELECTED_TRACK',
        payload: newIndex,
    };
}

/**
 * Builds the master bus and the default instrument track once the AudioContext
 * exists. TODO (pre-existing): this only runs because TrackList's instruments
 * mount before the store is ready.
 */
export function initInstrumentContext(newIndex) {
    return function (dispatch, getState) {
        const audioContext = AudioEngine.getContext();
        const { trackList } = getState().tracks;
        const masterTrack = Utils.getTrackByIndex(trackList, 0);
        const track = Utils.getTrackByIndex(trackList, newIndex);
        if (!audioContext || !masterTrack || !track) {
            return;
        }
        const masterNode = new Track(AudioEngine.setPlugins(masterTrack.id, []), null, null, audioContext, 1, 0);
        AudioEngine.setTrackNode(masterTrack.id, masterNode);
        const instrument = new MultiOsc(undefined, audioContext);
        AudioEngine.setTrackNode(
            track.id,
            new Track(AudioEngine.setPlugins(track.id, []), instrument, masterNode.input, audioContext, 1, 0),
        );
        AudioEngine.setInstrument(track.id, instrument);
        dispatch({
            type: 'INIT_INSTRUMENT_CONTEXT',
            payload: {
                index: newIndex,
                instrument: describeInstrument(instrument),
            },
        });
    };
}

export function changeTrackVolume(newIndex, newVolume) {
    return function (dispatch, getState) {
        dispatch({
            type: 'CHANGE_TRACK_VOLUME',
            payload: {
                index: newIndex,
                volume: newVolume,
            },
        });
        const trackId = trackIdByIndex(getState().tracks.trackList, newIndex);
        if (trackId !== undefined) {
            AudioEngine.applyTrackVolume(trackId, newVolume);
        }
    };
}

export function changeTrackPan(newIndex, newPan) {
    return function (dispatch, getState) {
        dispatch({
            type: 'CHANGE_TRACK_PAN',
            payload: {
                index: newIndex,
                pan: newPan,
            },
        });
        const trackId = trackIdByIndex(getState().tracks.trackList, newIndex);
        if (trackId !== undefined) {
            AudioEngine.applyTrackPan(trackId, newPan);
        }
    };
}

export function changeTrackInstrument(newTrackInstrumentId, newIndex) {
    return function (dispatch, getState) {
        const audioContext = AudioEngine.getContext();
        const instrument = InstrumentsUtils.getNewInstrumentByIndex(newTrackInstrumentId, undefined, audioContext);
        dispatch({
            type: 'CHANGE_TRACK_INSTRUMENT',
            payload: {
                index: newIndex,
                instrument: describeInstrument(instrument),
            },
        });
        const trackId = trackIdByIndex(getState().tracks.trackList, newIndex);
        if (trackId !== undefined) {
            AudioEngine.setInstrument(trackId, instrument);
            AudioEngine.applyTrackInstrument(trackId, instrument);
        }
    };
}

export function changeTrackOutput(newIndex, newOutputIndex) {
    return function (dispatch, getState) {
        dispatch({
            type: 'CHANGE_TRACK_OUTPUT',
            payload: {
                index: newIndex,
                outputIndex: newOutputIndex,
            },
        });
        const { trackList } = getState().tracks;
        const trackId = trackIdByIndex(trackList, newIndex);
        if (trackId !== undefined) {
            // The reducer used to pass the output *index* straight into
            // Track.updateTrackNode, which expects an AudioNode.
            AudioEngine.refreshTrackNode(trackId, destinationInput(trackList, newOutputIndex));
        }
    };
}

export function addNewTrackModalVisibilitySwitch() {
    return {
        type: 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH',
    };
}

export function changeSoloState(index) {
    return function (dispatch, getState) {
        dispatch({
            type: 'CHANGE_TRACK_SOLO_STATE',
            payload: index,
        });
        applyTrackStates(getState().tracks);
    };
}

export function changeMuteState(index) {
    return function (dispatch, getState) {
        dispatch({
            type: 'CHANGE_TRACK_MUTE_STATE',
            payload: index,
        });
        const trackId = trackIdByIndex(getState().tracks.trackList, index);
        if (trackId !== undefined) {
            AudioEngine.applyTrackMute(trackId);
        }
    };
}

export function updateInstrumentPreset(newPreset, newTrackIndex) {
    return function (dispatch, getState) {
        const trackId = trackIdByIndex(getState().tracks.trackList, newTrackIndex);
        const instrument = trackId === undefined ? undefined : AudioEngine.getInstrument(trackId);
        if (instrument) {
            instrument.updatePreset(newPreset);
        }
        dispatch({
            type: 'UPDATE_INSTRUMENT_PRESET',
            payload: {
                index: newTrackIndex,
                preset: newPreset,
            },
        });
    };
}

export function trackIndexUp(newIndex) {
    return {
        type: 'TRACK_INDEX_UP',
        payload: newIndex,
    };
}

export function trackIndexDown(newIndex) {
    return {
        type: 'TRACK_INDEX_DOWN',
        payload: newIndex,
    };
}

export function addNewPlugin(newIndex, newPluginId) {
    return function (dispatch, getState) {
        const audioContext = AudioEngine.getContext();
        const track = Utils.getTrackByIndex(getState().tracks.trackList, newIndex);
        if (!track) {
            return;
        }
        const plugins = AudioEngine.getPlugins(track.id);
        AudioEngine.addPlugin(track.id, PluginsUtils.getNewPluginByIndex(newPluginId, plugins.length, audioContext));
        // The engine mutates the array the Track node holds, so refreshing the
        // node is what actually rewires the chain.
        AudioEngine.refreshTrackNode(track.id);
        dispatch({
            type: 'SET_TRACK_PLUGINS',
            payload: {
                index: newIndex,
                pluginList: describePlugins(AudioEngine.getPlugins(track.id)),
            },
        });
    };
}

export function removePlugin(newTrackIndex, newPluginIndex) {
    return function (dispatch, getState) {
        const trackId = trackIdByIndex(getState().tracks.trackList, newTrackIndex);
        if (trackId === undefined) {
            return;
        }
        AudioEngine.removePlugin(trackId, newPluginIndex);
        AudioEngine.refreshTrackNode(trackId);
        dispatch({
            type: 'SET_TRACK_PLUGINS',
            payload: {
                index: newTrackIndex,
                pluginList: describePlugins(AudioEngine.getPlugins(trackId)),
            },
        });
    };
}

export function changePluginPreset(newTrackIndex, newPluginIndex, newPreset) {
    return function (dispatch, getState) {
        const trackId = trackIdByIndex(getState().tracks.trackList, newTrackIndex);
        if (trackId !== undefined) {
            AudioEngine.updatePluginPreset(trackId, newPluginIndex, newPreset);
        }
        dispatch({
            type: 'CHANGE_PLUGIN_PRESET',
            payload: {
                index: newTrackIndex,
                pluginIndex: newPluginIndex,
                preset: newPreset,
            },
        });
    };
}

/**
 * Rebuilds every instrument, plugin and track graph from an exported (plain,
 * serializable) tracks state and swaps the descriptors in.
 */
export function loadTrackState(newState) {
    return function (dispatch, getState) {
        const audioContext = AudioEngine.getContext();
        const loaded = Utils.copy(newState);
        const masterTrack = Utils.getTrackByIndex(getState().tracks.trackList, 0);
        const masterId = masterTrack ? masterTrack.id : 0;

        // Builds the live chain, registers it under the track id and leaves the
        // descriptor copy on the track that goes into the store.
        const buildPluginList = (sourceTrack, targetTrack, trackId) => {
            const plugins = AudioEngine.setPlugins(trackId, []);
            for (let j = 0; j < sourceTrack.pluginList.length; j++) {
                plugins.push(PluginsUtils.getNewPluginByIndex(sourceTrack.pluginList[j].id, j, audioContext));
                plugins[j].updatePreset(sourceTrack.pluginList[j].preset);
            }
            targetTrack.pluginList = describePlugins(plugins);
            return plugins;
        };

        // Master keeps its existing node; only its plugin chain is replaced.
        loaded.trackList[0].id = masterId;
        const masterPluginList = buildPluginList(newState.trackList[0], loaded.trackList[0], masterId);
        const masterNode = AudioEngine.getTrackNode(masterId);
        if (masterNode) {
            masterNode.pluginNodeList = masterPluginList;
            masterNode.updateTrackNode();
        }

        // Every other track is rebuilt from scratch under a fresh id.
        AudioEngine.clearTrackNodes();
        AudioEngine.clearInstruments();
        // Master's chain was just registered, so keep it while dropping the rest.
        const masterPlugins = AudioEngine.getPlugins(masterId);
        AudioEngine.clearPlugins();
        AudioEngine.setPlugins(masterId, masterPlugins);
        if (masterNode) {
            AudioEngine.setTrackNode(masterId, masterNode);
        }
        let nextTrackId = masterId + 1;
        for (let i = 1; i < loaded.trackList.length; i++) {
            const track = loaded.trackList[i];
            track.id = nextTrackId++;
            const pluginList = buildPluginList(newState.trackList[i], track, track.id);
            let instrument = null;
            if (track.trackType !== TrackTypes.aux) {
                instrument = InstrumentsUtils.getNewInstrumentByIndex(
                    newState.trackList[i].instrument.id,
                    undefined,
                    audioContext,
                );
                instrument.updatePreset(newState.trackList[i].instrument.preset);
            }
            track.instrument = describeInstrument(instrument);
            AudioEngine.setInstrument(track.id, instrument);
            AudioEngine.setTrackNode(
                track.id,
                new Track(
                    pluginList,
                    instrument,
                    destinationInput(loaded.trackList, track.output),
                    audioContext,
                    track.volume,
                    track.pan,
                ),
            );
        }

        dispatch({
            type: 'LOAD_TRACK_STATE',
            payload: {
                ...loaded,
                nextTrackId: nextTrackId,
            },
        });
    };
}

/** Replays the whole tracks state into the audio graph (used after a load). */
export function updateAllTrackNodes() {
    return function (dispatch, getState) {
        applyTrackStates(getState().tracks, { replayMute: true });
    };
}
