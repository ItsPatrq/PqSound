import Sampler from './Sampler';
import PqSynth from './PqSynth';
import Monotron from './Monotron';
import MultiOsc from './MultiOsc';
import { Instruments as InstrumentsEnum } from '../constants/Constants';

interface InstrumentUtils {
    getNewInstrumentByIndex(id: number, preset: any, audioContext: AudioContext): any;
}
const Utils: InstrumentUtils = {
    getNewInstrumentByIndex: (id: number, preset: any, audioContext: AudioContext) => {
        switch (id) {
            case InstrumentsEnum.Sampler.id: {
                return new Sampler(preset, audioContext);
            }
            case InstrumentsEnum.PqSynth.id: {
                return new PqSynth(preset, audioContext);
            }
            case InstrumentsEnum.Monotron.id: {
                return new Monotron(preset, audioContext);
            }
            case InstrumentsEnum.MultiOsc.id: {
                return new MultiOsc(preset, audioContext);
            }
            default: {
                return;
            }
        }
    },
};

export { Sampler, PqSynth, Monotron, MultiOsc, Utils };
