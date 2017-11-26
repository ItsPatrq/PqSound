export function addTrackToComposition(){
    return {
        type: 'ADD_TRACK_TO_COMPOSITION'
    }
}
export function removeTrackFromComposition(index){
    return {
        type: 'REMOVE_TRACK_FROM_COMPOSITION',
        payload: index
    }
}
export function addRegion(newTrackIndex, newStart, length){
    return {
        type: 'ADD_REGION',
        payload: {
            trackIndex: newTrackIndex,
            start: newStart,
            length: length
        }
    }
}
export function changeOctaveNumber(number) {
    return{
        type: 'CHANGE_BITS_NUMBER',
        payload: number
    }
}
export function showPianoRoll(newTrackIndex, newRegionIndex) {
    return{
        type: 'SHOW_PIANO_ROLL',
        payload: {
            trackIndex: newTrackIndex,
            regionIndex: newRegionIndex
        }
    }
}
export function hidePianoRoll() {
    return{
        type: 'HIDE_PIANO_ROLL'
    }
}
export function updateTrackComposition(newPianoKey, newQuarterIndex, newSixteenthIndex) {
    return{
        type: 'UPDATE_TRACK_COMPOSITION',
        payload: {
            pianoKey: newPianoKey,
            quarterIndex: newQuarterIndex,
            sixteenthIndex: newSixteenthIndex
        }
    }
}

export function addNote (newRegionId, newNoteNumber, newSixteenthNumber, newNoteLength) {
    return{
        type: 'ADD_NOTE',
        payload: {
            regionId: newRegionId,
            noteNumber: newNoteNumber,
            sixteenthNumber: newSixteenthNumber,
            noteLength: newNoteLength
        }
    }
}