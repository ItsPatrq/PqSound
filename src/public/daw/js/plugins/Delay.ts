import { PluginsEnum } from '../constants/Constants';
import Plugin from './Plugin';

class Delay extends Plugin {
    delayArray: any[];
    inputGainNode: GainNode;
    dryGainNode: GainNode;
    outputGainNode: GainNode;
    wetGainNode: GainNode;
    private lastIterations?: number;
    constructor(index, audioContext) {
        super(PluginsEnum.Delay, index, audioContext);
        this.preset = {
            delay: 0.5,
            feedback: 0.8,
            highCut: 5200,
            lowCut: 660,
            dry: 1,
            wet: 1,
            iterations: 10,
        };
        this.delayArray = [];
        this.inputGainNode = this.context.createGain();
        this.outputGainNode = this.context.createGain();
        this.dryGainNode = this.context.createGain();
        this.wetGainNode = this.context.createGain();

        this.updateNodes();

        this.inputGainNode.connect(this.dryGainNode);
        this.inputGainNode.connect(this.wetGainNode);

        this.dryGainNode.connect(this.outputGainNode);

        this.input = this.inputGainNode;
        this.output = this.outputGainNode;
    }
    updateNodes() {
        const now = this.context.currentTime;
        // The delay network topology only depends on `iterations`; when it is unchanged,
        // update the existing nodes' params in place instead of rebuilding the whole graph.
        if (this.preset.iterations === this.lastIterations) {
            for (let i = 0; i < this.preset.iterations; i++) {
                const [delay, feedback, highCutFilter, lowCutFilter] = this.delayArray.slice(i * 4, i * 4 + 4);
                delay.delayTime.setValueAtTime(this.preset.delay ? this.preset.delay : 0.000001, now);
                feedback.gain.setValueAtTime(this.preset.feedback ? this.preset.feedback : 0.000001, now);
                lowCutFilter.frequency.setValueAtTime(this.preset.lowCut ? this.preset.lowCut : 0.000001, now);
                highCutFilter.frequency.setValueAtTime(this.preset.highCut ? this.preset.highCut : 0.000001, now);
            }
        } else {
            for (let i = 0; i < this.delayArray.length; i++) {
                this.delayArray[i].disconnect();
            }
            this.wetGainNode.disconnect();
            this.delayArray.length = 0;
            for (let i = 0; i < this.preset.iterations; i++) {
                const delay = this.context.createDelay();
                delay.delayTime.setValueAtTime(this.preset.delay ? this.preset.delay : 0.000001, now);
                const feedback = this.context.createGain();
                feedback.gain.setValueAtTime(this.preset.feedback ? this.preset.feedback : 0.000001, now);
                const lowCutFilter = this.context.createBiquadFilter();
                lowCutFilter.type = 'highpass';
                lowCutFilter.frequency.setValueAtTime(this.preset.lowCut ? this.preset.lowCut : 0.000001, now);
                const highCutFilter = this.context.createBiquadFilter();
                highCutFilter.type = 'lowpass';
                highCutFilter.frequency.setValueAtTime(this.preset.highCut ? this.preset.highCut : 0.000001, now);
                if (i !== 0) {
                    this.delayArray[i * 4 - 1].connect(delay);
                }
                delay.connect(feedback);
                feedback.connect(highCutFilter);
                highCutFilter.connect(lowCutFilter);
                lowCutFilter.connect(this.outputGainNode);
                this.delayArray.push(delay, feedback, highCutFilter, lowCutFilter);
            }
            this.wetGainNode.connect(this.delayArray[0]);
            this.lastIterations = this.preset.iterations;
        }

        this.dryGainNode.gain.setValueAtTime(this.preset.dry ? this.preset.dry : 0.000001, now);
        this.wetGainNode.gain.setValueAtTime(this.preset.wet ? this.preset.wet : 0.000001, now);
    }
}

export default Delay;
