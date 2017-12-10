import Store from '../stroe';
import { Instruments, keyFrequencies } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency } from 'engine/Utils';

class MonotronVoise {
    constructor(frequency, startTime) {
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;
            this.frequency = frequency;
            this.vco = this.context.createOscillator();
            this.lfo = this.context.createOscillator();
            this.lfoGain = this.context.createGain();
            this.vcf = this.context.createBiquadFilter();
            this.output = this.context.createGain();

            this.vco.connect(this.vcf);
            this.vcf.connect(this.output);
            this.lfo.connect(this.lfoGain);
            this.lfoGain.connect(this.vcf.frequency);

            this.output.gain.setValueAtTime(0.0001, startTime || this.context.currentTime);
            this.vco.type = 'sawtooth'
            this.lfo.type = 'sawtooth'
            this.vco.frequency.setValueAtTime(frequency, startTime || this.context.currentTime);

            this.vco.start(startTime || this.context.currentTime);
            this.lfo.start(startTime || this.context.currentTime);
        }
    }

    start(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(1.0, time + 0.01);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
        setTimeout(() => {
            this.vco.disconnect();
            this.lfo.disconnect();
            this.lfoGain.disconnect();
            this.vcf.disconnect();
        }, Math.floor((time - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class Monotron {
    constructor(preset = null) {
        this.name = Instruments.Monotron.name;
        this.id = Instruments.Monotron.id;
        this.preset = preset;
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;
            this.output = this.context.createGain();
            this.voices = new Array;
        }
    }

    noteOn(note, startTime) {
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            let frequency = keyFrequencies[note];
            let currVoice = new MonotronVoise(frequency, startTime);
            currVoice.connect(this.output);
            currVoice.start(startTime);
            this.voices[note] = currVoice;
        }
    }

    noteOff(note, endTime) {
        if (!isNullOrUndefined(this.voices[note])) {
            endTime = endTime || this.context.currentTime;
            this.voices[note].stop(endTime);
            delete this.voices[note];
        }
    }

    connect(target) {
        this.output.connect(target);
    }
}

export default Monotron;