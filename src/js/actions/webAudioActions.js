export function initializeWebAudio() {
    return {
        type: 'INIT_WEB_AUDIO'
    }
}

export function fetchSamplerInstrument(instrumentName, needToUpdateKeyboard=false, loadVolume=1) {
    return function (dispatch) {
        dispatch({
            type: 'NEED_TO_FETCH_SAMPLER_INSTRUMENT',
            payload: {
                name: instrumentName,
                callback: () => {
                    dispatch({
                        type: 'FETCHED_SAMPLER_INSTRUMENT',
                        payload: instrumentName
                    })
                    console.log('helo');
                    if (needToUpdateKeyboard) {
                        dispatch({
                            type: 'LOAD_KEYBOARD_SOUNDS',
                            payload: {
                                name: instrumentName,
                                volume: loadVolume
                            }
                        })
                }
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
