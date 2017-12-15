import * as Constants from 'constants/Constants';
import MIDIController from 'engine/MIDIController';

export default function reducer(state = {
    BPM: 120,
    minBPM: 40,
    maxBPM: 300,
    playing: false,
    show: false,
    tool: Constants.tools.draw.id,
    noteDrawLength: 2,
    regionDrawLength: 2,
    maxRegionDrawLength: 16,
    sixteenthNotePlaying: 0,
    midiController: new MIDIController(),
    selectedInputDevice: null,
    selectedOutputDevice: null
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
        case 'UPDATE_CURRENT_TIME':{
            return {
                ...state,
                sixteenthNotePlaying: action.payload
            }
        }
        case 'UPDATE_MIDI_CONTROLLER':{
            return {
                ...state,
                midiController: action.payload
            }
        }
    }

    return state;
}