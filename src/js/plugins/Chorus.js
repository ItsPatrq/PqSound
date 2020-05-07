import { PluginsEnum } from 'constants/Constants';
import Plugin from './Plugin';

class Chorus extends Plugin {
    constructor(index, audioContext) {
        super(PluginsEnum.Chorus, index, audioContext)
        this.preset = {
            feedback: 0.4,
            delay: 0.03,
            depth: 0.002,
            rate: 3.5,
            dry: 0.5,
            wet: 0.5
        }

        this.dryGain = this.context.createGain();
        this.wetGain = this.context.createGain();
        this.feedbackGainNodeLR = this.context.createGain();
        this.feedbackGainNodeRL = this.context.createGain();
        this.splitter = this.context.createChannelSplitter(2);
        this.delayL = this.context.createDelay();
        this.delayR = this.context.createDelay();
        this.merger = this.context.createChannelMerger(2);
        this.osc = this.context.createOscillator();
        this.depthL = this.context.createGain();
        this.depthR = this.context.createGain();
        this.input = this.context.createGain();
        this.output = this.context.createGain();

        this.input.connect(this.dryGain);
        this.input.connect(this.wetGain);
        this.dryGain.connect(this.output);
        this.wetGain.connect(this.splitter);
        this.splitter.connect(this.delayL, 0);
        this.splitter.connect(this.delayR, 1);
        this.delayL.connect(this.feedbackGainNodeLR);
        this.delayR.connect(this.feedbackGainNodeRL);
        this.feedbackGainNodeLR.connect(this.delayR);
        this.feedbackGainNodeRL.connect(this.delayL);
        this.delayL.connect(this.merger, 0, 0);
        this.delayR.connect(this.merger, 0, 1);
        this.merger.connect(this.output);
        this.osc.connect(this.depthL);
        this.osc.connect(this.depthR);
        this.depthL.connect(this.delayL.delayTime);
        this.depthR.connect(this.delayR.delayTime);

        this.osc.type = 'triangle';

        this.updateNodes();

        this.osc.start(this.context.currentTime);
    }
    updateNodes() {
        this.delayL.delayTime.setValueAtTime(this.preset.delay, this.context.currentTime);
        this.delayR.delayTime.setValueAtTime(this.preset.delay, this.context.currentTime);
        this.depthL.gain.setValueAtTime(this.preset.depth, this.context.currentTime);
        this.depthR.gain.setValueAtTime(-this.preset.depth, this.context.currentTime);
        this.osc.frequency.setValueAtTime(this.preset.rate, this.context.currentTime);
        this.feedbackGainNodeLR.gain.setValueAtTime(this.preset.feedback ?
            this.preset.feedback : 0.00001, this.context.currentTime);
        this.feedbackGainNodeRL.gain.setValueAtTime(this.preset.feedback ?
            this.preset.feedback : 0.00001, this.context.currentTime);
        this.dryGain.gain.setValueAtTime(this.preset.dry ?
            this.preset.dry : 0.00001, this.context.currentTime);
        this.wetGain.gain.setValueAtTime(this.preset.wet ?
            this.preset.wet : 0.00001, this.context.currentTime);
    }
}

export default Chorus;