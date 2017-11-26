import * as Utils from 'engine/Utils';
import * as compositionParser from 'engine/CompositionParser';

export default function reducer(state = {
    bitsInComposition: 48,
    showPianoRoll: false,
    pianoRollRegion: null,
    pianoRollTrack: null,
    regionsPerTrack: [
        {
            trackIndex: 1,
            regions: [

            ]
        }
    ],
    regionList: new Array,
    regionLastId: 0
}, action) {
    switch (action.type) {
        case 'ADD_TRACK_TO_COMPOSITION': {
            let newRegionsPerTrack = JSON.parse(JSON.stringify(state.regionsPerTrack));
            newRegionsPerTrack.push({
                trackIndex: state.regionsPerTrack.length + 1,
                regions: [

                ]
            });
            return {
                ...state,
                regionsPerTrack: newRegionsPerTrack
            }
        }
        case 'REMOVE_TRACK_FROM_COMPOSITION': {
            let newRegionsPerTrack = JSON.parse(JSON.stringify(state.regionsPerTrack));
            for(let i = 0; i < newRegionsPerTrack.length; i++){
                if(newRegionsPerTrack[i].trackIndex === action.payload){
                    newRegionsPerTrack.splice(i, 1);
                    for (let j = i; j < newRegionsPerTrack.length; j++) {
                        newRegionsPerTrack[j].trackIndex = j + 1;
                    }
                    break;
                }
            }
            return {
                ...state,
                regionsPerTrack: newRegionsPerTrack
            }
        }
        case 'ADD_REGION':{
            let newRegionsPerTrack = JSON.parse(JSON.stringify(state.regionsPerTrack));
            let newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            let newRegionLastId = state.regionLastId;
            for(let i = 0; i < newRegionsPerTrack.length; i++){
                if(newRegionsPerTrack[i].trackIndex === action.payload.trackIndex){
                    newRegionsPerTrack[i].regions.push({
                        start: action.payload.start,
                        end: action.payload.start + action.payload.length - 1,
                        id: ++newRegionLastId
                    });
                    newRegionsList.push({
                        id: newRegionLastId,
                        regionLength: action.payload.length,
                        notes: new Array(88)
                    });
                    break;
                }
            }
            return {
                ...state,
                regionsPerTrack: newRegionsPerTrack,
                regionList: newRegionsList,
                regionLastId: newRegionLastId
            }
        }
        case 'ADD_NOTE':{
            let newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            let currRegion = compositionParser.getRegionByRegionId(action.payload.regionId, newRegionsList);
            if(Utils.isNullOrUndefined(currRegion.notes[action.payload.noteNumber])){
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
        case 'HIDE_PIANO_ROLL': {
            return {
                ...state,
                showPianoRoll: false
            }
        }
    }

    return state;
}