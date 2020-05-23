import Store from '../stroe';

export function addTrack(newTrackType) {
    const audioContext = Store.getState().webAudio.context;
    return {
        type: 'ADD_TRACK',
        payload: {
            trackType: newTrackType,
            audioContext: audioContext,
        },
    };
}

export function removeTrack(index) {
    return {
        type: 'REMOVE_TRACK',
        payload: index,
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

export function initTrackSound(newIndex) {
    return {
        type: 'INIT_TRACK_SOUND',
        payload: newIndex,
    };
}

export function initInstrumentContext(newIndex) {
    const audioContext = Store.getState().webAudio.context;
    return {
        type: 'INIT_INSTRUMENT_CONTEXT',
        payload: {
            index: newIndex,
            audioContext: audioContext,
        },
    };
}

export function changeTrackVolume(newIndex, newVolume) {
    return {
        type: 'CHANGE_TRACK_VOLUME',
        payload: {
            index: newIndex,
            volume: newVolume,
        },
    };
}

export function changeTrackPan(newIndex, newPan) {
    return {
        type: 'CHANGE_TRACK_PAN',
        payload: {
            index: newIndex,
            pan: newPan,
        },
    };
}

export function changeTrackInstrument(newTrackInstrumentId, newIndex) {
    const audioContext = Store.getState().webAudio.context;
    return {
        type: 'CHANGE_TRACK_INSTRUMENT',
        payload: {
            index: newIndex,
            trackInstrumentId: newTrackInstrumentId,
            audioContext: audioContext,
        },
    };
}

export function changeTrackOutput(newIndex, newOutputIndex) {
    return {
        type: 'CHANGE_TRACK_OUTPUT',
        payload: {
            index: newIndex,
            outputIndex: newOutputIndex,
        },
    };
}

export function addNewTrackModalVisibilitySwitch() {
    return {
        type: 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH',
    };
}

export function changeSoloState(index) {
    return {
        type: 'CHANGE_TRACK_SOLO_STATE',
        payload: index,
    };
}

export function changeMuteState(index) {
    return {
        type: 'CHANGE_TRACK_MUTE_STATE',
        payload: index,
    };
}

export function updateInstrumentPreset(newPreset, newTrackIndex) {
    return {
        type: 'UPDATE_INSTRUMENT_PRESET',
        payload: {
            index: newTrackIndex,
            preset: newPreset,
        },
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
    const audioContext = Store.getState().webAudio.context;
    return {
        type: 'ADD_NEW_PLUGIN',
        payload: {
            index: newIndex,
            pluginId: newPluginId,
            audioContext: audioContext,
        },
    };
}

export function removePlugin(newTrackIndex, newPluginIndex) {
    return {
        type: 'REMOVE_PLUGIN',
        payload: {
            index: newTrackIndex,
            pluginIndex: newPluginIndex,
        },
    };
}

export function changePluginPreset(newTrackIndex, newPluginIndex, newPreset) {
    return {
        type: 'CHANGE_PLUGIN_PRESET',
        payload: {
            index: newTrackIndex,
            pluginIndex: newPluginIndex,
            preset: newPreset,
        },
    };
}

export function loadTrackState(newState) {
    const audioContext = Store.getState().webAudio.context;
    return {
        type: 'LOAD_TRACK_STATE',
        payload: {
            stateToLoad: newState,
            audioContext: audioContext,
        },
    };
}

export function updateAllTrackNodes() {
    return {
        type: 'UPDATE_ALL_TRACK_NODES',
    };
}
