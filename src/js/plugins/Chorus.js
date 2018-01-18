import { PluginsEnum } from 'constants/Constants';
import Plugin from './Plugin';

class Chorus extends Plugin {
    constructor(index) {
        super(PluginsEnum.Chorus, index)
        this.preset = {
            feedback: 0.4,
            rate: 1
        }

        this.attenuator = this.context.createGain();
        this.splitter = this.context.createChannelSplitter(2);
        this.delayL = this.context.createDelay();
        this.delayR = this.context.createDelay();
        this.feedbackGainNodeLR = this.context.createGain();
        this.feedbackGainNodeRL = this.context.createGain();
        this.merger = this.context.createChannelMerger(2);
        this.lfoL = this.context.createOscillator();
        this.lfoR = this.context.createOscillator();

        this.lfoL.type = 'sine'
        this.lfoR.type = 'sine'

        this.input = this.context.createGain();
        this.output = this.context.createGain();

        this.input.connect(this.attenuator);
        this.attenuator.connect(this.output);
        this.attenuator.connect(this.splitter);
        this.splitter.connect(this.delayL, 0);
        this.splitter.connect(this.delayR, 1);
        this.delayL.connect(this.feedbackGainNodeLR);
        this.delayR.connect(this.feedbackGainNodeRL);
        this.feedbackGainNodeLR.connect(this.delayR);
        this.feedbackGainNodeRL.connect(this.delayL);
        this.delayL.connect(this.merger, 0, 0);
        this.delayR.connect(this.merger, 0, 1);
        this.merger.connect(this.output);
        this.lfoL.connect(this.delayL.delayTime);
        this.lfoR.connect(this.delayR.delayTime);

        this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
        this.updateNodes();

        this.lfoL.start(this.context.currentTime);
        this.lfoR.start(this.context.currentTime);
    }
    updateNodes() {
        this.feedbackGainNodeLR.gain.setValueAtTime(this.preset.feedback ?
            this.preset.feedback : -0.000001, this.context.currentTime);
        this.feedbackGainNodeRL.gain.setValueAtTime(this.preset.feedback ?
            this.preset.feedback : 0.000001, this.context.currentTime);
        this.lfoL.frequency.setValueAtTime(this.preset.rate ?
            this.preset.rate : -0.000001, this.context.currentTime);
        this.lfoR.frequency.setValueAtTime(this.preset.rate ?
            this.preset.rate : -0.000001, this.context.currentTime);
    }
}

export default Chorus;