import AudioEngine from 'engine/AudioEngine';
import { setCurrentTime, updateMidiState } from 'slices/controlSlice';

/**
 * The control slice owns the plain creators; they are re-exported here so the
 * existing import paths keep working. The two thunks below stay, because they
 * touch the engine before dispatching.
 */
export {
    switchPlayState,
    changeBPM,
    changeTool,
    changeSecoundaryTool,
    changeRegionDrawLength,
    changeNoteDrawLength,
    updateCurrentTime,
    updateMidiState,
    switchAltKey,
    switchUploadModalVisibility,
    switchAboutModalVisibility,
    loadControlState,
    textInputFocusedSwitch,
    copyRegion,
} from 'slices/controlSlice';

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

// Moving the playhead has to move the scheduler's cursor too — a mutation, so
// it happens here rather than inside the reducer.
export function changeCurrentTime(newSixteenthNotePlaying) {
    return function (dispatch) {
        const sequencer = AudioEngine.getSequencer();
        if (sequencer) {
            sequencer.sixteenthPlaying = newSixteenthNotePlaying;
        }
        dispatch(setCurrentTime(newSixteenthNotePlaying));
    };
}
