
import Sampler from './Sampler';
import PqSynth from './PqSynth';
import Monotron from './Monotron';
import MultiOsc from './MultiOsc';
import {Instruments as InstrumentsEnum} from 'constants/Constants'
let Utils = {};

Utils.getNewInstrumentByIndex = (id, preset, audioContext) => {
    switch(id) {
        case InstrumentsEnum.Sampler.id:{
            return new Sampler(preset, audioContext);
        }
        case InstrumentsEnum.PqSynth.id:{
            return new PqSynth(preset, audioContext);
        }
        case InstrumentsEnum.Monotron.id:{
            return new Monotron(preset, audioContext);
        }
        case InstrumentsEnum.MultiOsc.id:{
            return new MultiOsc(preset, audioContext);
        }
    }
}

module.exports = {
    Sampler,
    PqSynth,
    Monotron,
    MultiOsc,
    Utils
}