import * as Constants from 'constants/Constants';
import MIDIController from 'engine/MIDIController';

export default function reducer(state = {
    BPM: 120,
    minBPM: 40,
    maxBPM: 300,
    playing: false,
    show: false,
    tool: Constants.tools.draw.id,
    secoundaryTool: Constants.tools.select.id,
    noteDrawLength: 2,
    regionDrawLength: 2,
    maxRegionDrawLength: 16,
    sixteenthNotePlaying: 0,
    altClicked: false,
    sequencer: null,
    showUploadModal: false,
    midiController: new MIDIController()
}, action) {
    switch (action.type) {
        case 'SWITCH_PLAY_STATE': {
            return {
                ...state,
                playing: !state.playing            }
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
        case 'CHANGE_SECOUNDARY_TOOL':{
            return {
                ...state,
                secoundaryTool: action.payload
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
        case 'CHANGE_CURRENT_TIME':{
            state.sequencer.sixteenthPlaying = action.payload;
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
        case 'CHANGE_MIDI_DEVICE':{
            return {
                ...state,
                midiController: state.midiController.changeMidiDevice(action.payload)
            }
        }
        case 'SWITCH_ALT_KEY':{
            return {
                ...state,
                altClicked: !state.altClicked
            }
        }
        case 'INIT_SEQUENCER':{
            return {
                ...state,
                sequencer: action.payload
            }
        }
        case 'SWITCH_UPLOAD_MODAL_VISIBILITY':{
            return {
                ...state,
                showUploadModal: !state.showUploadModal
            }
        }
        case 'LOAD_CONTROL_STATE':{
            return {
                ...state,
                ...action.payload
            }
        }
    }

    return state;
}