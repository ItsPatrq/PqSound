import * as Utils from 'engine/Pq.Utils';
import * as AudioFiles from 'engine/audioFiles';
import BufferLoader from 'engine/BufferLoader';
import Sound from 'engine/Sound';

export default function reducer(state = {
    context: null,
    bufferLoader: null,
    samplerInstrumentsSounds: null,
    keyboard: {
        instrument: null,
        sounds: null
    },
    fetching: false
}, action) {
    switch (action.type) {
        case 'INIT_WEB_AUDIO': {
            let newContext = null;
            let newSamplerInstrumentsSounds = new Array;
            let newBufferLoader = null;
            try {
                newContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                //TODO: error panel
                alert('Web Audio API is not supported in this browser');
            }

            newBufferLoader = new BufferLoader(newContext);

            for (let i = 0; i < Utils.samplerInstruments.length; i++) {
                newSamplerInstrumentsSounds.push({
                    name: Utils.samplerInstruments[i],
                    loaded: false,
                    buffer: new Array
                });
            }
            return {
                ...state,
                context: newContext,
                bufferLoader: newBufferLoader,
                samplerInstrumentsSounds: newSamplerInstrumentsSounds
            }
        }
        case 'NEED_TO_FETCH_SAMPLER_INSTRUMENT': {
            let newBufferLoader = { ...state.bufferLoader };

            newBufferLoader.urlList = AudioFiles[action.payload.name];
            newBufferLoader.onload = action.payload.callback;
            newBufferLoader.load();
            return {
                ...state,
                bufferLoader: newBufferLoader,
                fetching: true
            }
        }
        case 'FETCHED_SAMPLER_INSTRUMENT': {
            let newSamplerInstrumentsSounds = JSON.parse(JSON.stringify(state.samplerInstrumentsSounds));

            let instrumentIndex;
            for (let i = 0; i < newSamplerInstrumentsSounds.length; i++) {
                if (newSamplerInstrumentsSounds[i].name === action.payload) {
                    instrumentIndex = i;
                    break;
                }
            }
            for (let i = 0; i < state.bufferLoader.bufferList.length; i++) {
                newSamplerInstrumentsSounds[instrumentIndex].buffer.push(state.bufferLoader.bufferList[i]);
            }
            state.bufferLoader.bufferList.length = 0;
            newSamplerInstrumentsSounds[instrumentIndex].loaded = true;

            return {
                ...state,
                samplerInstrumentsSounds: newSamplerInstrumentsSounds,
                fetching: false
            }
        }
        case 'LOAD_KEYBOARD_SOUNDS': {
            let index;
            let newKeyboardSounds = new Array;

            for (let i = 0; i < state.samplerInstrumentsSounds.length; i++) {
                if (state.samplerInstrumentsSounds[i].name === action.payload.name) {
                    index = i;
                    break;
                }
            }
            for (let i = 0; i < 12; i++) {
                newKeyboardSounds.push(new Sound(state.context, state.samplerInstrumentsSounds[index].buffer[i], action.payload.volume));
            }
            return {
                ...state,
                keyboard: {
                    instrument: action.payload.name,
                    sounds: newKeyboardSounds
                }
            }
        }
    }

    return state;
}

