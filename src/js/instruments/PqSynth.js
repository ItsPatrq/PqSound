import Store from '../stroe';
import { Instruments, keyFrequencies } from 'constants/Constants';
import {isNullOrUndefined} from 'engine/Utils';

class PqSynth {
    constructor(preset = null) {
        if(!isNullOrUndefined(Store)){
            this.context = Store.getState().webAudio.context;
        }
        this.name = Instruments.PqSynth.name;
        this.id = Instruments.PqSynth.id;
        this.preset = preset;
    }

    getInstrumentSoundNode(note) {
        let oscillator = this.context.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.value = keyFrequencies[note];
        return oscillator;
        
    }
}


export default PqSynth;