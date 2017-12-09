
import Sampler from './Sampler';
import PqSynth from './PqSynth';
import {Instruments as InstrumentsEnum} from 'constants/Constants'
let Utils = {};

Utils.getInstrumentByIndex = (id) => {
    console.log(InstrumentsEnum)
    switch(id) {
        case InstrumentsEnum.Sampler.id:{
            return new Sampler();
        }
        case InstrumentsEnum.PqSynth.id:{
            return new PqSynth();
        }
    }
}

module.exports = {
    Sampler,
    PqSynth,
    Utils
}