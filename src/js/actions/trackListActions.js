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