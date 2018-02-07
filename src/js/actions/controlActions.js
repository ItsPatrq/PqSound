export function switchPlayState() {
    return {
        type: 'SWITCH_PLAY_STATE'
    }
}

export function changeBPM(BPM) {
    return {
        type: 'CHANGE_BPM',
        payload: BPM
    }
}

export function changeTool(tool){
    return{
        type: 'CHANGE_TOOL',
        payload: tool
    }
}

export function changeSecoundaryTool(tool){
    return{
        type: 'CHANGE_SECOUNDARY_TOOL',
        payload: tool
    }
}

export function changeRegionDrawLength(length){
    return {
        type: 'CHANGE_REGION_DRAW_LENGTH',
        payload: length
    }
}

export function changeNoteDrawLength(length){
    return {
        type: 'CHANGE_NOTE_DRAW_LENGTH',
        payload: length
    }
}

export function updateCurrentTime(newSixteenthNotePlaying){
    return {
        type: 'UPDATE_CURRENT_TIME',
        payload: newSixteenthNotePlaying
    }
}

export function updateMidiController(midiController){
    return {
        type: 'UPDATE_MIDI_CONTROLLER',
        payload: midiController
    }
}

export function changeMidiDevice(deviceId){
    return {
        type: 'CHANGE_MIDI_DEVICE',
        payload: deviceId
    }
}

export function switchAltKey(){
    return {
        type: 'SWITCH_ALT_KEY'
    }
}

export function initSequencer(sequencer){
    return {
        type: 'INIT_SEQUENCER',
        payload: sequencer
    }
}

export function changeCurrentTime(newSixteenthNotePlaying){
    return {
        type: 'CHANGE_CURRENT_TIME',
        payload: newSixteenthNotePlaying
    }
}

export function switchUploadModalVisibility(){
    return {
        type: 'SWITCH_UPLOAD_MODAL_VISIBILITY'
    }
}

export function switchAboutModalVisibility(){
    return {
        type: 'SWITCH_ABOUT_MODAL_VISIBILITY'
    }
}

export function loadControlState(newState){
    return {
        type: 'LOAD_CONTROL_STATE',
        payload: newState
    }
}

export function textInputFocusedSwitch(){
    return {
        type: 'TEXT_INPUT_FOCUSED_SWITCH'
    }
}

export function copyRegion(regionIndex){
    return {
        type: 'COPY_REGION',
        payload: regionIndex
    }
}