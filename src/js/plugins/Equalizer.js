import { PluginsEnum } from 'constants/Constants';
import Store from '../stroe';

class Equalizer {
    constructor(index) {
        this.name = PluginsEnum.Equalizer.name;
        this.id = PluginsEnum.Equalizer.id;
        this.index = index;
        this.context = Store.getState().webAudio.context;
        this.preset = {
            lowFilterGain: 1.0,
            midFilterGain: 1.0,
            highFilterGain: 1.0,
            lowBandSplit: 360,
            highBandSplit: 3600,
            gainDb: -40.0
        };        
        this.hBand = this.context.createBiquadFilter();
        this.hBand.type = "lowshelf";
        this.hBand.frequency.setValueAtTime(this.preset.lowBandSplit, this.context.currentTime);
        this.hBand.gain.setValueAtTime(this.preset.gainDb, this.context.currentTime);

        this.hInvert = this.context.createGain();
        this.hInvert.gain.setValueAtTime(-1.0, this.context.currentTime);

        this.mBand = this.context.createGain();

        this.lBand = this.context.createBiquadFilter();
        this.lBand.type = "highshelf";
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
    updatePreset(newPreset) {
        this.preset = { ...this.preset, ...newPreset };
        this.lGain.gain.setValueAtTime(this.preset.lowFilterGain, this.context.currentTime);
        this.mGain.gain.setValueAtTime(this.preset.midFilterGain, this.context.currentTime);
        this.hGain.gain.setValueAtTime(this.preset.highFilterGain, this.context.currentTime);        
    }

    getPluginNode(){
        return {input: this.input, output: this.output}
    }

}

export default Equalizer;