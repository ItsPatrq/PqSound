export function addTrack(newTrackType) {
    return{
        type: 'ADD_TRACK',
        payload: {
            trackType: newTrackType
        }
    }
}

export function removeTrack(index) {
    return{
        type: 'REMOVE_TRACK',
        payload: index
    }
}

export function changeRecordState(index) {
    return{
        type: 'CHANGE_RECORD_STATE',
        payload: index
    }
}

export function changeTrackName(newName, newIndex) {
    return{
        type: 'CHANGE_TRACK_NAME',
        payload:
        {
            index: newIndex,
            newTrackName: newName
        }
    }
}

export function changeSelectedTrack(newIndex){
    return{
        type: 'CHANGE_SELECTED_TRACK',
        payload: newIndex
    }
}

export function initTrackSound(newIndex){
    return{
        type: 'INIT_TRACK_SOUND',
        payload: newIndex
    }
}

export function initInstrumentContext(newIndex){
    return{
        type: 'INIT_INSTRUMENT_CONTEXT',
        payload: newIndex
    }
}

export function changeTrackVolume(newIndex, newVolume){
    return{
        type: 'CHANGE_TRACK_VOLUME',
        payload: {
            index: newIndex,
            volume: newVolume
        }
    }
}

export function changeTrackPan(newIndex, newPan){
    return{
        type: 'CHANGE_TRACK_PAN',
        payload: {
            index: newIndex,
            pan: newPan
        }
    }
}

export function changeTrackInstrument(newTrackInstrumentId, newIndex){
    return {
        type: 'CHANGE_TRACK_INSTRUMENT',
        payload: {
            index: newIndex,
            trackInstrumentId: newTrackInstrumentId
        }
    }
}

export function changeTrackOutput(newIndex, newOutputIndex){
    return {
        type: 'CHANGE_TRACK_OUTPUT',
        payload: {
            index: newIndex,
            outputIndex: newOutputIndex
        }
    }
}

export function addNewTrackModalVisibilitySwitch() {
    return {
        type: 'ADD_NEW_TRACK_MODAL_VISIBILITY_SWITCH'
    }
}

export function changeSoloState(index) {
    return {
        type: 'CHANGE_TRACK_SOLO_STATE',
        payload: index
    }
}

export function changeMuteState(index) {
    return {
        type: 'CHANGE_TRACK_MUTE_STATE',
        payload: index
    }
}

export function updateInstrumentPreset(newPreset, newTrackIndex){
    return {
        type: 'UPDATE_INSTRUMENT_PRESET',
        payload: {
            index: newTrackIndex,
            preset: newPreset
        }
    }
}

export function trackIndexUp(newIndex){
    return {
        type: 'TRACK_INDEX_UP',
        payload: newIndex
    }
}

export function trackIndexDown(newIndex){
    return {
        type: 'TRACK_INDEX_DOWN',
        payload: newIndex
    }
}

export function addNewPlugin(newIndex, newPluginId){
    return {
        type: 'ADD_NEW_PLUGIN',
        payload: {
            index: newIndex,
            pluginId: newPluginId
        }
    }
}

export function removePlugin(newTrackIndex, newPluginIndex){
    return {
        type: 'REMOVE_PLUGIN',
        payload: {
            index: newTrackIndex,
            pluginIndex: newPluginIndex
        }
    }
}

export function changePluginPreset(newTrackIndex, newPluginIndex, newPreset){
    return {
        type: 'CHANGE_PLUGIN_PRESET',
        payload: {
            index: newTrackIndex,
            pluginIndex: newPluginIndex,
            preset: newPreset
        }
    }
}

export function loadTrackState(newState){
    return {
        type: 'LOAD_TRACK_STATE',
        payload: newState
    }
}

export function updateAllTrackNodes(){
    return {
        type: 'UPDATE_ALL_TRACK_NODES'
    }
}