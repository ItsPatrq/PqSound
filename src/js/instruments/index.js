
import Sampler from './Sampler';
import PqSynth from './PqSynth';
import Monotron from './Monotron';
import {Instruments as InstrumentsEnum} from 'constants/Constants'
let Utils = {};

Utils.getInstrumentByIndex = (id) => {
    switch(id) {
        case InstrumentsEnum.Sampler.id:{
            return new Sampler();
        }
        case InstrumentsEnum.PqSynth.id:{
            return new PqSynth();
        }
        case InstrumentsEnum.Monotrone.id:{
            return new Monotron();
        }
    }
}

module.exports = {
    Sampler,
    PqSynth,
    Utils
}