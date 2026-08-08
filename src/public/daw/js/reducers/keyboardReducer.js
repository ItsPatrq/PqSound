import { createSlice } from '@reduxjs/toolkit';

import * as Utils from 'engine/Utils';
import { defaultKeyBindings } from 'constants/Constants';

/**
 * First slice converted to RTK's createSlice (#156 follow-up). The bodies read
 * as mutations but run through Immer, so the copy-on-write rules the store's
 * immutableCheck enforces still hold. Action creators are re-exported from
 * actions/keyboardActions, so call sites are unchanged.
 */
const keyboardSlice = createSlice({
    name: 'keyboard',
    initialState: {
        width: 0,
        firstKey: 27, // C3 — the visible range always starts on a C
        show: false,
        notesPlaying: [],
        keyNamesVisible: true,
        keyBindings: defaultKeyBindings,
        keyBindVisible: true,
    },
    reducers: {
        changeOctaveNumber(state, action) {
            state.octaves = action.payload;
        },
        // Omit the payload to toggle, pass true/false to set it explicitly.
        switchKeyboardVisibility(state, action) {
            state.show = Utils.isNullUndefinedOrEmpty(action.payload) ? !state.show : action.payload;
        },
        updateWidth(state, action) {
            state.width = action.payload;
        },
        changeFirstKeyboardKey(state, action) {
            state.firstKey = action.payload;
        },
        addPlayingNote(state, action) {
            state.notesPlaying.push(action.payload);
        },
        removePlayingNote(state, action) {
            // Only the first occurrence: a note can be held from the keyboard
            // and MIDI at once.
            const position = state.notesPlaying.indexOf(action.payload);
            if (position !== -1) {
                state.notesPlaying.splice(position, 1);
            }
        },
        changeKeyBindings(state, action) {
            state.keyBindings.forEach((binding) => {
                binding.MIDINote = binding.MIDINote + action.payload;
            });
        },
        switchKeyNameVisibility(state) {
            state.keyNamesVisible = !state.keyNamesVisible;
        },
        switchKeyBindVisibility(state) {
            state.keyBindVisible = !state.keyBindVisible;
        },
    },
});

export const {
    changeOctaveNumber,
    switchKeyboardVisibility,
    updateWidth,
    changeFirstKeyboardKey,
    addPlayingNote,
    removePlayingNote,
    changeKeyBindings,
    switchKeyNameVisibility,
    switchKeyBindVisibility,
} = keyboardSlice.actions;
export default keyboardSlice.reducer;
