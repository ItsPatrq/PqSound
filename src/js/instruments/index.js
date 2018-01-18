
import Sampler from './Sampler';
import PqSynth from './PqSynth';
import Monotron from './Monotron';
import MultiOsc from './MultiOsc';
import {Instruments as InstrumentsEnum} from 'constants/Constants'
let Utils = {};

Utils.getNewInstrumentByIndex = (id, preset) => {
    switch(id) {
        case InstrumentsEnum.Sampler.id:{
            return new Sampler(preset);
        }
        case InstrumentsEnum.PqSynth.id:{
            return new PqSynth(preset);
        }
        case InstrumentsEnum.Monotron.id:{
            return new Monotron(preset);
        }
        case InstrumentsEnum.MultiOsc.id:{
            return new MultiOsc(preset);
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