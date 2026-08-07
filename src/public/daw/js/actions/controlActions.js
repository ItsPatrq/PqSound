import AudioEngine from 'engine/AudioEngine';

export function switchPlayState() {
    return {
        type: 'SWITCH_PLAY_STATE',
    };
}

export function changeBPM(BPM) {
    return {
        type: 'CHANGE_BPM',
        payload: BPM,
    };
}

export function changeTool(tool) {
    return {
        type: 'CHANGE_TOOL',
        payload: tool,
    };
}

export function changeSecoundaryTool(tool) {
    return {
        type: 'CHANGE_SECOUNDARY_TOOL',
        payload: tool,
    };
}

export function changeRegionDrawLength(length) {
    return {
        type: 'CHANGE_REGION_DRAW_LENGTH',
        payload: length,
    };
}

export function changeNoteDrawLength(length) {
    return {
        type: 'CHANGE_NOTE_DRAW_LENGTH',
        payload: length,
    };
}

export function updateCurrentTime(newSixteenthNotePlaying) {
    return {
        type: 'UPDATE_CURRENT_TIME',
        payload: newSixteenthNotePlaying,
    };
}

/**
 * `midiState` is the serializable snapshot produced by
 * `MIDIController.toState()`; the controller instance itself stays in the
 * engine layer.
 */
export function updateMidiState(midiState) {
    return {
        type: 'UPDATE_MIDI_STATE',
        payload: midiState,
    };
}

// Selecting a device rewires `onmidimessage` on a live MIDIPort, so it runs in
// the engine and only the resulting snapshot is dispatched.
export function changeMidiDevice(deviceId) {
    return function (dispatch) {
        const midiController = AudioEngine.getMidiController();
        if (!midiController) {
            return;
        }
        midiController.changeMidiDevice(deviceId);
        dispatch(updateMidiState(midiController.toState()));
    };
}

export function switchAltKey() {
    return {
        type: 'SWITCH_ALT_KEY',
    };
}

// Moving the playhead has to move the scheduler's cursor too — a mutation, so
// it happens here rather than inside the reducer.
export function changeCurrentTime(newSixteenthNotePlaying) {
    return function (dispatch) {
        const sequencer = AudioEngine.getSequencer();
        if (sequencer) {
            sequencer.sixteenthPlaying = newSixteenthNotePlaying;
        }
        dispatch({
            type: 'CHANGE_CURRENT_TIME',
            payload: newSixteenthNotePlaying,
        });
    };
}

export function switchUploadModalVisibility() {
    return {
        type: 'SWITCH_UPLOAD_MODAL_VISIBILITY',
    };
}

export function switchAboutModalVisibility() {
    return {
        type: 'SWITCH_ABOUT_MODAL_VISIBILITY',
    };
}

export function loadControlState(newState) {
    return {
        type: 'LOAD_CONTROL_STATE',
        payload: newState,
    };
}

export function textInputFocusedSwitch() {
    return {
        type: 'TEXT_INPUT_FOCUSED_SWITCH',
    };
}

export function copyRegion(regionIndex) {
    return {
        type: 'COPY_REGION',
        payload: regionIndex,
    };
}
