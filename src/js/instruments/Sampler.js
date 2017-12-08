import Store from '../stroe';
import { instruments } from 'constants/Constants';
import {isNullOrUndefined} from 'engine/Utils';

class Sampler {
    constructor(preset) {
        if(!isNullOrUndefined(Store)){
            this.context = Store.getState().webAudio.context;
        }
        this.name = instruments.sampler.name;
        this.id = instruments.sampler.id;
        this.preset = preset;
    }

    initContext(){
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