import { createSlice } from '@reduxjs/toolkit';

import * as Constants from 'constants/Constants';

/**
 * Transport, tools and modal flags. Converted to createSlice (#156 follow-up);
 * the plain action creators are re-exported from actions/controlActions, which
 * keeps the two thunks that live alongside them.
 */
const controlSlice = createSlice({
    name: 'control',
    initialState: {
        BPM: 120,
        minBPM: 40,
        maxBPM: 300,
        playing: false,
        show: false,
        tool: Constants.tools.draw.id,
        secoundaryTool: Constants.tools.select.id,
        copiedRegion: null,
        noteDrawLength: 2,
        regionDrawLength: 2,
        maxRegionDrawLength: 16,
        sixteenthNotePlaying: 0,
        altClicked: false,
        showUploadModal: false,
        showAboutModal: false,
        textInputFocused: false,
        // Serializable mirror of the MIDIController the engine owns.
        midi: {
            supported: false,
            inputs: [],
            selectedInputId: null,
        },
    },
    reducers: {
        switchPlayState(state) {
            state.playing = !state.playing;
        },
        changeBPM(state, action) {
            state.BPM = action.payload;
        },
        changeTool(state, action) {
            state.tool = action.payload;
        },
        changeSecoundaryTool(state, action) {
            state.secoundaryTool = action.payload;
        },
        changeRegionDrawLength(state, action) {
            state.regionDrawLength = action.payload;
        },
        changeNoteDrawLength(state, action) {
            state.noteDrawLength = action.payload;
        },
        // The scheduler reports the playhead; changeCurrentTime (a thunk) moves
        // it, and both land on the same field.
        updateCurrentTime(state, action) {
            state.sixteenthNotePlaying = action.payload;
        },
        setCurrentTime(state, action) {
            state.sixteenthNotePlaying = action.payload;
        },
        // Serializable snapshot from MIDIController.toState().
        updateMidiState(state, action) {
            state.midi = action.payload;
        },
        switchAltKey(state) {
            state.altClicked = !state.altClicked;
        },
        switchUploadModalVisibility(state) {
            state.showUploadModal = !state.showUploadModal;
        },
        switchAboutModalVisibility(state) {
            state.showAboutModal = !state.showAboutModal;
        },
        loadControlState(state, action) {
            return { ...state, ...action.payload };
        },
        textInputFocusedSwitch(state) {
            state.textInputFocused = !state.textInputFocused;
        },
        copyRegion(state, action) {
            state.copiedRegion = action.payload;
        },
    },
});

export const {
    switchPlayState,
    changeBPM,
    changeTool,
    changeSecoundaryTool,
    changeRegionDrawLength,
    changeNoteDrawLength,
    updateCurrentTime,
    setCurrentTime,
    updateMidiState,
    switchAltKey,
    switchUploadModalVisibility,
    switchAboutModalVisibility,
    loadControlState,
    textInputFocusedSwitch,
    copyRegion,
} = controlSlice.actions;

export default controlSlice.reducer;
