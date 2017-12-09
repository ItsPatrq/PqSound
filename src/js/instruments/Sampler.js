import Store from '../stroe';
import { Instruments } from 'constants/Constants';
import { Presets } from 'constants/SamplerPresets';
import { isNullOrUndefined } from 'engine/Utils';

class Sampler {
    constructor(preset = Presets.DSKGrandPiano) {
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;
        }
        this.name = Instruments.Sampler.name;
        this.id = Instruments.Sampler.id;
        this.preset = preset;
    }

    initContext() {
        this.context = Store.getState().webAudio.context;
    }

    getBuffers(note) {
        let samplerInstruments = Store.getState().webAudio.samplerInstrumentsSounds;
        for (let i = 0; i < samplerInstruments.length; i++) {
            if (samplerInstruments[i].name === this.preset.name) {
                return samplerInstruments[i].buffer[note];
            }
        }
    }

    getInstrumentSoundNode(note) {
        let source = this.context.createBufferSource();
        source.buffer = this.getBuffers(note);
        return source;

    }
}


export default Sampler;