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