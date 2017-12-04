export function addTrack(track) {
    return{
        type: 'ADD_TRACK',
        payload: track
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

export function changeTrackPreset(newPreset, newIndex) {
    return {
        type: 'CHANGE_TRACK_PRESET',
        payload: {
            index: newIndex,
            preset: newPreset
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

export function changeTrackVolume(newIndex, newVolume){
    return{
        type: 'CHANGE_TRACK_VOLUME',
        payload: {
            index: newIndex,
            volume: newVolume
        }
    }
}