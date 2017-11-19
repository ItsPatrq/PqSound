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