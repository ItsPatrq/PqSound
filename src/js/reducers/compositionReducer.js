import * as Utils from 'engine/Utils';
import * as compositionParser from 'engine/CompositionParser';

export default function reducer(state = {
    barsInComposition: 48,
    maxBarsInComposition: 1000,
    showPianoRoll: false,
    pianoRollRegion: null,
    regionList: new Array,
    regionLastId: 0
}, action) {
    switch (action.type) {
        case 'REMOVE_TRACK_FROM_COMPOSITION': {
            let newRegionList = state.regionList.filter((el) => { return el.trackIndex !== action.payload })
            for (let i = 0; i < newRegionList.length; i++) {
                if (newRegionList[i].trackIndex > action.payload) {
                    newRegionList[i].trackIndex = newRegionList[i].trackIndex - 1;
                }
            }
            let newPianoRollRegion = state.pianoRollRegion === action.payload ? null : state.pianoRollRegion
            return {
                ...state,
                regionList: newRegionList,
                pianoRollRegion: newPianoRollRegion
            }
        }
        case 'ADD_REGION': {
            let newRegionList = JSON.parse(JSON.stringify(state.regionList));
            let newRegionLastId = state.regionLastId;
            newRegionList.push({
                id: ++newRegionLastId,
                trackIndex: action.payload.trackIndex,
                regionLength: action.payload.length,
                start: action.payload.start,
                end: action.payload.start + action.payload.length - 1,
                notes: new Array(88)
            });
            return {
                ...state,
                regionList: newRegionList,
                regionLastId: newRegionLastId
            }
        }
        case 'PASTE_REGION': {
            let newRegionList = JSON.parse(JSON.stringify(state.regionList));
            let newRegionLastId = state.regionLastId;
            let copiedRegion =  compositionParser.getRegionByRegionId(action.payload.copiedRegion, newRegionList);
            newRegionList.push({
                id: ++newRegionLastId,
                trackIndex: action.payload.trackIndex,
                regionLength: copiedRegion.regionLength,
                start: action.payload.start,
                end: action.payload.start + copiedRegion.regionLength - 1,
                notes: JSON.parse(JSON.stringify(copiedRegion.notes))
            });
            return {
                ...state,
                regionList: newRegionList,
                regionLastId: newRegionLastId
            }
        }
        case 'REMOVE_REGION': {
            return {
                ...state,
                regionList: state.regionList.filter((el) => { return el.id !== action.payload })
            }
        }
        case 'ADD_NOTE': {
            let newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            let currRegion = compositionParser.getRegionByRegionId(action.payload.regionId, newRegionsList);
            if (Utils.isNullOrUndefined(currRegion.notes[action.payload.noteNumber])) {
                currRegion.notes[action.payload.noteNumber] = new Array;
            }
            currRegion.notes[action.payload.noteNumber].push({
                sixteenthNumber: action.payload.sixteenthNumber,
                length: action.payload.noteLength
            })
            return {
                ...state,
                regionList: newRegionsList
            }
        }
        case 'REMOVE_NOTE': {
            let newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            let currRegion = compositionParser.getRegionByRegionId(action.payload.regionId, newRegionsList);
            for (let i = 0; i < currRegion.notes[action.payload.noteNumber].length; i++) {
                if (currRegion.notes[action.payload.noteNumber][i].sixteenthNumber <= action.payload.sixteenthNumber &&
                    currRegion.notes[action.payload.noteNumber][i].sixteenthNumber +
                    currRegion.notes[action.payload.noteNumber][i].length > action.payload.sixteenthNumber) {
                    currRegion.notes[action.payload.noteNumber].splice(i, 1);
                    break;
                }
            }
            return {
                ...state,
                regionList: newRegionsList
            }
        }
        case 'CHANGE_BITS_NUMBER': {
            return {
                ...state,
                barsInComposition: action.payload
            }
        }
        case 'SHOW_PIANO_ROLL': {
            return {
                ...state,
                showPianoRoll: true,
                pianoRollRegion: action.payload.regionIndex
            }
        }
        case 'SWITCH_PIANO_ROLL_VISIBILITY': {
            let show;
            if (Utils.isNullUndefinedOrEmpty(action.payload)) {
                if (Utils.isNullUndefinedOrEmpty(state.pianoRollRegion)) {
                    show = false
                } else {
                    show = !state.showPianoRoll;
                }
            } else {
                show = action.payload;
            }
            return {
                ...state,
                showPianoRoll: show
            }
        }
        case 'CHANGE_BARS_IN_COMPOSITION': {
            return {
                ...state,
                barsInComposition: action.payload
            }
        }
        case 'LOAD_COMPOSITION_STATE': {
            return {
                ...action.payload
            }
        }
    }

    return state;
}