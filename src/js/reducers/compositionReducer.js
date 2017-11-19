import * as Utils from '../engine/Pq.Utils';

export default function reducer(state = {
    bitsInComposition: 48,
    tracksCompositions: [
        null,
        Array.apply(null, {length: 48}).map(() => [])
    ],
    showPianoRoll: false,
    pianoRollRegion: null,
    pianoRollTrack: null
}, action) {
    switch (action.type) {
        case 'CHANGE_BITS_NUMBER': {
            return {
                ...state,
                bitsInComposition: action.payload
            }
        }
        case 'SHOW_PIANO_ROLL': {
            return {
                ...state,
                showPianoRoll: true,
                pianoRollRegion: action.payload.regionIndex,
                pianoRollTrack: action.payload.trackIndex
            }
        }
        case 'HIDE_PIANO_ROLL':{
            return {
                ...state,
                showPianoRoll: false
            }
        }
        case 'UPDATE_TRACK_COMPOSITION': {
            let newTracksCompositions = JSON.parse(JSON.stringify(state.tracksCompositions));
            if (Utils.isNullOrUndefined(newTracksCompositions[state.pianoRollTrack])) {
                newTracksCompositions[state.pianoRollTrack] = new Array;
            }
            if (Utils.isNullOrUndefined(newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion])) {
                newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion] = new Array;
            }
            if (Utils.isNullOrUndefined(newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion]
            [action.payload.pianoKey])) {
                newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion][action.payload.pianoKey] = new Array;
            }
            if (Utils.isNullOrUndefined(newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion]
            [action.payload.pianoKey][action.payload.quarterIndex])) {
                newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion][action.payload.pianoKey]
                [action.payload.quarterIndex] = new Array;
            }
            newTracksCompositions[state.pianoRollTrack][state.pianoRollRegion][action.payload.pianoKey]
            [action.payload.quarterIndex][action.payload.sixteenthIndex] = !newTracksCompositions[state.pianoRollTrack]
            [state.pianoRollRegion][action.payload.pianoKey][action.payload.quarterIndex][action.payload.sixteenthIndex];
            return {
                ...state,
                tracksCompositions: newTracksCompositions
            }
        }
    }

    return state;
}