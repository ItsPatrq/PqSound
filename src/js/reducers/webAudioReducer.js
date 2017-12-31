import SamplerPresets from 'constants/SamplerPresets';
import BufferLoader from 'engine/BufferLoader';
import Sound from 'engine/Sound';
import * as Utils from 'engine/Utils';
export default function reducer(state = {
    context: null,
    sound: null,
    bufferLoader: null,
    samplerInstrumentsSounds: new Array
}, action) {
    switch (action.type) {
        case 'INIT_WEB_AUDIO': {
            let newContext = null;
            let newSamplerInstrumentsSounds = new Array;
            let newBufferLoader = null;
            let newSound = null;
            try {
                newContext = new (window.AudioContext || window.webkitAudioContext)();
                newSound = new Sound(newContext);
            } catch (e) {
                //TODO: error panel
                alert('Web Audio API is not supported in this browser');
            }

            newBufferLoader = new BufferLoader(newContext);

            for (let i = 0; i < SamplerPresets.length; i++) {
                for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
                    newSamplerInstrumentsSounds.push({
                        name: SamplerPresets[i].presets[j].name,
                        id: SamplerPresets[i].presets[j].id,
                        loaded: false,
                        fetching: false,
                        buffer: new Array
                    })
                }
            }
            return {
                ...state,
                context: newContext,
                sound: newSound,
                bufferLoader: newBufferLoader,
                samplerInstrumentsSounds: newSamplerInstrumentsSounds
            }
        }
        case 'NEED_TO_FETCH_SAMPLER_INSTRUMENT': {
            let newBufferLoader = { ...state.bufferLoader };
            let newSamplerInstrumentsSounds = [...state.samplerInstrumentsSounds]
            for (let i = 0; i < SamplerPresets.length; i++) {
                for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
                    if (SamplerPresets[i].presets[j].id === action.payload.instrumentId) {
                        newBufferLoader.urlList = SamplerPresets[i].presets[j].content.map((el) => { return el.url });
                        break;
                    }
                }
            }
            for (let i = 0; i < newSamplerInstrumentsSounds.length; i++) {
                if (newSamplerInstrumentsSounds[i].id === action.payload.instrumentId) {
                    newSamplerInstrumentsSounds[i].fetching = true;
                    break;
                }

            }
            newBufferLoader.onload = action.payload.callback;
            newBufferLoader.load();
            return {
                ...state,
                bufferLoader: newBufferLoader,
                samplerInstrumentsSounds: newSamplerInstrumentsSounds
            }
        }
        case 'FETCHED_SAMPLER_INSTRUMENT': {
            //let newSamplerInstrumentsSounds = JSON.parse(JSON.stringify(state.samplerInstrumentsSounds));
            let newSamplerInstrumentsSounds = [...state.samplerInstrumentsSounds];
            let instrumentIndex;
            for (let i = 0; i < newSamplerInstrumentsSounds.length; i++) {
                if (newSamplerInstrumentsSounds[i].id === action.payload) {
                    instrumentIndex = i;
                    break;
                }
            }
            for (let i = 0; i < state.bufferLoader.bufferList.length; i++) {

                newSamplerInstrumentsSounds[instrumentIndex].buffer.push(state.bufferLoader.bufferList[i]);
            }
            newSamplerInstrumentsSounds[instrumentIndex].loaded = true;
            newSamplerInstrumentsSounds[instrumentIndex].fetching = false;

            return {
                ...state,
                samplerInstrumentsSounds: newSamplerInstrumentsSounds,
                bufferLoader: new BufferLoader(state.context)
            }
        }
    }

    return state;
}