import { PluginsEnum } from 'constants/Constants';
import Plugin from './Plugin';

class Reverb extends Plugin {
    constructor(index) {
        super(PluginsEnum.Reverb, index)
        this.preset = {
            seconds: 1,
            decay: 2,
            reverse: 0,
            dry: 0.3,
            wet: 0.7
        };
        this.convolver = this.context.createConvolver();
        this.convolver.normalize = true;
        this.inputGainNode = this.context.createGain();
        this.outputGainNode = this.context.createGain();
        this.dryGainNode = this.context.createGain();
        this.wetGainNode = this.context.createGain();

        this.inputGainNode.connect(this.dryGainNode);
        this.inputGainNode.connect(this.wetGainNode);
        this.dryGainNode.connect(this.outputGainNode);
        this.wetGainNode.connect(this.convolver);
        this.convolver.connect(this.outputGainNode);

        this.input = this.inputGainNode;
        this.output = this.outputGainNode;
        this.updateNodes();
    }

    updateNodes(){
        let rate = this.context.sampleRate,
            length = rate * this.preset.seconds,
            decay = this.preset.decay,
            impulse = this.context.createBuffer(2,length ? length : 1,rate),
            impulseL = impulse.getChannelData(0),
            impulseR = impulse.getChannelData(1),
            n;
            for(let i = 0; i < length; i++){
                n = this.preset.reverse ? length - i : i;
                impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
                impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            }
            this.convolver.buffer = impulse;
            this.dryGainNode.gain.setValueAtTime(this.preset.dry ?
                this.preset.dry : 0.000001, this.context.currentTime);
            this.wetGainNode.gain.setValueAtTime(this.preset.wet ?
                this.preset.wet : 0.000001, this.context.currentTime);
    }
}

export default Reverb;