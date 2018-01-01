import { PluginsEnum } from 'constants/Constants';
import Plugin from './Plugin';

class Compressor extends Plugin{
    constructor(index){
        super(PluginsEnum.Compressor, index)
        this.preset = {
            threashold: -50,
            knee: 40,
            ratio: 12,
            attack: 0,
            release: 0.25
        }

        this.compressorNode = this.context.createDynamicsCompressor();
        this.updateNodes();

        this.input = this.compressorNode;
        this.output = this.compressorNode;
    }
    updateNodes(){
        this.compressorNode.threshold.setValueAtTime(this.preset.threashold ?
            this.preset.threashold : -0.000001, this.context.currentTime);
        this.compressorNode.knee.setValueAtTime(this.preset.knee ?
            this.preset.knee : 0.000001, this.context.currentTime);
        this.compressorNode.ratio.setValueAtTime(this.preset.ratio ?
            this.preset.ratio : 0.000001, this.context.currentTime);
        this.compressorNode.attack.setValueAtTime(this.preset.attack ?
            this.preset.attack : 0.000001, this.context.currentTime);
        this.compressorNode.release.setValueAtTime(this.preset.release ?
            this.preset.release : 0.000001, this.context.currentTime);
    }
}

export default Compressor;