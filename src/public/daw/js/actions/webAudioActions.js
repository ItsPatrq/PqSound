import SamplerPresets from 'constants/SamplerPresets';
import AudioEngine from 'engine/AudioEngine';
import BufferLoader from 'engine/BufferLoader';
import { initWebAudio, samplerInstrumentFetching, samplerInstrumentFetched } from 'reducers/webAudioReducer';

/**
 * Builds the serializable per-instrument descriptor list. The decoded buffers
 * themselves never enter the store — they go to AudioEngine.
 */
function buildSamplerInstrumentDescriptors() {
    const descriptors = [];
    for (let i = 0; i < SamplerPresets.length; i++) {
        for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
            descriptors.push({
                name: SamplerPresets[i].presets[j].name,
                id: SamplerPresets[i].presets[j].id,
                loaded: false,
                fetching: false,
            });
        }
    }
    return descriptors;
}

function findPresetById(instrumentId) {
    for (let i = 0; i < SamplerPresets.length; i++) {
        for (let j = 0; j < SamplerPresets[i].presets.length; j++) {
            if (SamplerPresets[i].presets[j].id === instrumentId) {
                return SamplerPresets[i].presets[j];
            }
        }
    }
    return null;
}

/**
 * Creating the AudioContext is a side effect, so it happens here rather than in
 * the reducer; only the resulting flags are dispatched.
 */
export function initializeWebAudio() {
    return function (dispatch) {
        const initialized = AudioEngine.init();
        dispatch(
            initWebAudio({
                initialized: initialized,
                sampleRate: AudioEngine.getSampleRate(),
                samplerInstrumentsSounds: buildSamplerInstrumentDescriptors(),
            }),
        );
    };
}

export function fetchSamplerInstrument(newInstrumentId) {
    return function (dispatch) {
        const preset = findPresetById(newInstrumentId);
        const context = AudioEngine.getContext();
        if (!preset || !context) {
            return;
        }
        dispatch(samplerInstrumentFetching({ instrumentId: newInstrumentId }));
        const bufferLoader = new BufferLoader(
            context,
            preset.content.map((el) => el.url),
            (loadedBufferLoader) => {
                AudioEngine.setInstrumentBuffers(preset.name, loadedBufferLoader.bufferList);
                dispatch(samplerInstrumentFetched({ id: newInstrumentId }));
            },
        );
        bufferLoader.load();
    };
}
