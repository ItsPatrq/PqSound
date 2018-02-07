export function initializeWebAudio() {
    return {
        type: 'INIT_WEB_AUDIO'
    }
}

export function fetchSamplerInstrument(newInstrumentId) {
    return function (dispatch) {
        dispatch({
            type: 'NEED_TO_FETCH_SAMPLER_INSTRUMENT',
            payload: {
                instrumentId: newInstrumentId,
                callback: (newBufferLoader) => {
                    dispatch({
                        type: 'FETCHED_SAMPLER_INSTRUMENT',
                        payload: {
                            id: newInstrumentId,
                            bufferLoader: newBufferLoader
                        }
                    })
                }
            }
        });
    }
}

export function loadKeyboardSounds(loadName, loadVolume){
    return {
        type: 'LOAD_KEYBOARD_SOUNDS',
        payload: {
            name: loadName,
            volume: loadVolume
        }
    }
}
