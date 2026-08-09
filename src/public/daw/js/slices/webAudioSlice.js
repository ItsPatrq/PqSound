import { createSlice } from '@reduxjs/toolkit';

/**
 * Serializable-only slice. The live AudioContext / Sound / decoded buffers live
 * in `engine/AudioEngine`; this tracks just what the UI renders from. The
 * creators are re-exported from actions/webAudioActions, which keeps the thunks
 * that build the engine objects.
 */
const webAudioSlice = createSlice({
    name: 'webAudio',
    initialState: {
        initialized: false,
        sampleRate: null,
        samplerInstrumentsSounds: [],
    },
    reducers: {
        initWebAudio(state, action) {
            state.initialized = action.payload.initialized;
            state.sampleRate = action.payload.sampleRate;
            state.samplerInstrumentsSounds = action.payload.samplerInstrumentsSounds;
        },
        samplerInstrumentFetching(state, action) {
            const instrument = state.samplerInstrumentsSounds.find((curr) => curr.id === action.payload.instrumentId);
            if (instrument) {
                instrument.fetching = true;
            }
        },
        samplerInstrumentFetched(state, action) {
            const instrument = state.samplerInstrumentsSounds.find((curr) => curr.id === action.payload.id);
            if (instrument) {
                instrument.loaded = true;
                instrument.fetching = false;
            }
        },
    },
});

export const { initWebAudio, samplerInstrumentFetching, samplerInstrumentFetched } = webAudioSlice.actions;

export default webAudioSlice.reducer;
