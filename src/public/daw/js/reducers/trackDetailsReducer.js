import { createSlice } from '@reduxjs/toolkit';

/**
 * Panel visibility for the instrument and FX editor columns. Converted to
 * createSlice alongside the keyboard slice (#156 follow-up); action creators
 * are re-exported from actions/trackDetailsActions.
 */
const trackDetailsSlice = createSlice({
    name: 'trackDetails',
    initialState: {
        showInstrumentModal: false,
        showPluginModal: false,
        selectedPluginIndex: null,
        selectedPluginTrackIndex: null,
    },
    reducers: {
        // `show` optional: omit to toggle (the name-click), or pass true/false to
        // set it explicitly (open on instrument-change, close on the panel's ×
        // button) so the two callers can't desync the panel's open state.
        instrumentModalVisibilitySwitch(state, action) {
            state.showInstrumentModal = action.payload === undefined ? !state.showInstrumentModal : action.payload;
        },
        pluginModalVisibilitySwitch: {
            reducer(state, action) {
                state.showPluginModal = !state.showPluginModal;
                state.selectedPluginIndex = action.payload.selectedPluginIndex;
                state.selectedPluginTrackIndex = action.payload.selectedPluginTrackIndex;
            },
            // Keeps the two-positional-argument call signature the containers use.
            prepare(newPluginIndex, newTrackIndex) {
                return {
                    payload: {
                        selectedPluginIndex: newPluginIndex,
                        selectedPluginTrackIndex: newTrackIndex,
                    },
                };
            },
        },
    },
});

export const { instrumentModalVisibilitySwitch, pluginModalVisibilitySwitch } = trackDetailsSlice.actions;
export default trackDetailsSlice.reducer;
