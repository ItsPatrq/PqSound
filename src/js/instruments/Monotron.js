import Store from '../stroe';
import { Instruments, keyFrequencies } from 'constants/Constants';
import {isNullOrUndefined} from 'engine/Utils';

class Monotron {
    constructor(preset = null) {
        if(!isNullOrUndefined(Store)){
            this.context = Store.getState().webAudio.context;
        }
        this.name = Instruments.Monotrone.name;
        this.id = Instruments.Monotrone.id;
        this.preset = preset;
    }

    getInstrumentSoundNode(note) {
        let vco = this.context.createOscillator();
        let lfo = this.context.createOscillator();
        let lfoGain = this.context.createGain();
        let vcf = this.context.createBiquadFilter();
        let output = this.context.createGain();

        vco.connect(vcf);
        vcf.connect(output);
        lfo.connect(lfoGain);
        lfoGain.connect(vcf.frequency);

        output.gain.setValueAtTime(0, this.context.currentTime);
        vco.type = vco.SAWTOOTH;
        lfo.type = lfo.SAWTOOTH;
        vco.start(context.currentTime);
        lfo.start(context.currentTime);
        return output;
        
    }
}


export default Monotron;