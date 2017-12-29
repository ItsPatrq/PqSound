import { PluginsEnum } from 'constants/Constants';
import Plugin from './Plugin';

class Distortion extends Plugin {
    constructor(index) {
        super(PluginsEnum.Distortion, index);
        this.preset = {
            outputGain: 1,
            distortion: 0
        }
        this.gainNode = this.context.createGain();
        this.distortionNode = this.context.createWaveShaper();

        this.updateNodes();
        
        this.gainNode.connect(this.distortionNode);

        this.input = this.gainNode;
        this.output = this.distortionNode;
    }

    updateNodes() {
        this.gainNode.gain.setValueAtTime(this.preset.outputGain ?
            this.preset.outputGain : 0.000001, this.context.currentTime);
        this.distortionNode.curve = this.makeDistortionCurve(this.preset.distortion);
    }

    makeDistortionCurve(distortionAmount) {
        var k = typeof distortionAmount === 'number' ? distortionAmount : 0,
            n_samples = 44100,
            curve = new Float32Array(n_samples),
            deg = Math.PI / 180,
            i = 0,
            x;
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        console.log(curve)
        return curve;
    }

}

export default Distortion;