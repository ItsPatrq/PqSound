/**
 * Serializable-only slice. The live AudioContext / Sound / decoded buffers live
 * in `engine/AudioEngine`; this reducer tracks just what the UI renders from.
 */
export default function reducer(
    state = {
        initialized: false,
        sampleRate: null,
        samplerInstrumentsSounds: [],
    },
    action,
) {
    switch (action.type) {
        case 'INIT_WEB_AUDIO': {
            return {
                ...state,
                initialized: action.payload.initialized,
                sampleRate: action.payload.sampleRate,
                samplerInstrumentsSounds: action.payload.samplerInstrumentsSounds,
            };
        }
        case 'NEED_TO_FETCH_SAMPLER_INSTRUMENT': {
            return {
                ...state,
                samplerInstrumentsSounds: state.samplerInstrumentsSounds.map((instrument) =>
                    instrument.id === action.payload.instrumentId ? { ...instrument, fetching: true } : instrument,
                ),
            };
        }
        case 'FETCHED_SAMPLER_INSTRUMENT': {
            return {
                ...state,
                samplerInstrumentsSounds: state.samplerInstrumentsSounds.map((instrument) =>
                    instrument.id === action.payload.id ? { ...instrument, loaded: true, fetching: false } : instrument,
                ),
            };
        }
    }

    return state;
}
