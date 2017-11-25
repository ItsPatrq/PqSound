import * as Utils from 'engine/Utils';

export default function reducer(state = {
    BPM: 120,
    minBPM: 50,
    maxBPM: 250,
    playing: false,
    show: false,
    tool: Utils.tools.draw,
    noteDrawLength: 2,
    regionDrawLength: 2,
    maxRegionDrawLength: 16
}, action) {
    switch (action.type) {
        case 'SWITCH_PLAY_STATE': {
            return {
                ...state,
                playing: !state.playing
            }
        }
        case 'CHANGE_BPM':{
            return {
                ...state,
                BPM: action.payload
            }
        }
        case 'CHANGE_TOOL':{
            return {
                ...state,
                tool: action.payload
            }
        }
        case 'CHANGE_REGION_DRAW_LENGTH':{
            return {
                ...state,
                regionDrawLength: action.payload
            }
        }
        case 'CHANGE_NOTE_DRAW_LENGTH':{
            return {
                ...state,
                noteDrawLength: action.payload
            }
        }
    }

    return state;
}