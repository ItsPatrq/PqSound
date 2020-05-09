import { PluginsEnum } from '../constants/Constants';
import Plugin from './Plugin';

class Equalizer extends Plugin {
    sum: GainNode;
    inputGain: GainNode;
    hBand: BiquadFilterNode;
    hInvert: GainNode;
    lBand: BiquadFilterNode;
    mBand: GainNode;
    lInvert: GainNode;
    lGain: GainNode;
    mGain: any;
    hGain: any;

    constructor(index, audioContext) {
        super(PluginsEnum.Equalizer, index, audioContext)
        this.preset = {
            lowFilterGain: 1.0,
            midFilterGain: 1.0,
            highFilterGain: 1.0,
            lowBandSplit: 360,
            highBandSplit: 3600,
            gainDb: -40.0
        };
        this.hBand = this.context.createBiquadFilter();
        this.hBand.type = 'lowshelf';
        this.hBand.frequency.setValueAtTime(this.preset.lowBandSplit, this.context.currentTime);
        this.hBand.gain.setValueAtTime(this.preset.gainDb, this.context.currentTime);

        this.hInvert = this.context.createGain();
        this.hInvert.gain.setValueAtTime(-1.0, this.context.currentTime);

        this.mBand = this.context.createGain();

        this.lBand = this.context.createBiquadFilter();
        this.lBand.type = 'highshelf';
        this.lBand.frequency.setValueAtTime(this.preset.highBandSplit, this.context.currentTime);
        this.lBand.gain.setValueAtTime(this.preset.gainDb, this.context.currentTime);

        this.lInvert = this.context.createGain();
        this.lInvert.gain.setValueAtTime(-1.0, this.context.currentTime);

        this.hBand.connect(this.hInvert);
        this.lBand.connect(this.lInvert);

        this.hInvert.connect(this.mBand);
        this.lInvert.connect(this.mBand);

        this.lGain = this.context.createGain();
        this.mGain = this.context.createGain();
        this.hGain = this.context.createGain();

        this.inputGain = this.context.createGain();
        this.inputGain.connect(this.lBand);
        this.inputGain.connect(this.mBand);
        this.inputGain.connect(this.hBand);

        this.lBand.connect(this.lGain);
        this.mBand.connect(this.mGain);
        this.hBand.connect(this.hGain);

        this.sum = this.context.createGain();
        this.lGain.connect(this.sum);
        this.mGain.connect(this.sum);
        this.hGain.connect(this.sum);

        this.input = this.inputGain;
        this.output = this.sum;
    }

    updateNodes(){
        this.lGain.gain.setValueAtTime(this.preset.lowFilterGain ?
            this.preset.lowFilterGain : 0.000001, this.context.currentTime);
        this.mGain.gain.setValueAtTime(this.preset.midFilterGain ?
            this.preset.midFilterGain : 0.000001, this.context.currentTime);
        this.hGain.gain.setValueAtTime(this.preset.highFilterGain ?
            this.preset.highFilterGain : 0.000001, this.context.currentTime);
    }
}

export default Equalizer;