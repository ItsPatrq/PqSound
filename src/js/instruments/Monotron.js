import Store from '../stroe';
import { Instruments } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency } from 'engine/Utils';
import Instrument from './Instrument';

class MonotronVoise {
    constructor(frequency, startTime, preset, audioContext) {
        if (!isNullOrUndefined(audioContext)) {
            this.context = audioContext;
            this.frequency = frequency;
            this.mod = preset.mod;
            this.vco = this.context.createOscillator();
            this.lfo = this.context.createOscillator();
            this.lfoGain = this.context.createGain();
            this.vcf = this.context.createBiquadFilter();
            this.output = this.context.createGain();

            this.vco.connect(this.vcf);
            this.vcf.connect(this.output);
            this.lfo.connect(this.lfoGain);
            if (preset.mod === 'pitch') {
                this.lfoGain.connect(this.vco.frequency);
            } else if (preset.mod === 'cutoff') {
                this.lfoGain.connect(this.vcf.frequency);
            }

            this.output.gain.setValueAtTime(0.0001, this.context.currentTime);
            this.vco.type = 'sawtooth'
            this.lfo.type = 'sawtooth'
            this.vco.frequency.setValueAtTime(frequency + preset.vco.pitch, this.context.currentTime);
            this.lfo.frequency.setValueAtTime(preset.lfo.rate, this.context.currentTime);
            this.lfoGain.gain.setValueAtTime(preset.lfo.int, this.context.currentTime);
            this.vcf.frequency.setValueAtTime(preset.vcf.cutoff, this.context.currentTime);
            this.vcf.Q.setValueAtTime(preset.vcf.peak,this.context.currentTime);

            this.vco.start(this.context.currentTime);
            this.lfo.start(this.context.currentTime);
        }
    }

    start(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(0.7, time);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
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

    updatePreset(preset) {
        this.vco.frequency.setValueAtTime(this.frequency + preset.vco.pitch, this.context.currentTime);
        this.lfo.frequency.setValueAtTime(preset.lfo.rate, this.context.currentTime);
        this.lfoGain.gain.setValueAtTime(preset.lfo.int, this.context.currentTime)
        this.vcf.frequency.setValueAtTime(preset.vcf.cutoff, this.context.currentTime);
        this.vcf.Q.setValueAtTime(preset.vcf.peak, this.context.currentTime);
        if (preset.mod !== this.mod) {
            if (preset.mod === 'pitch') {
                this.lfoGain.disconnect();
                this.lfoGain.connect(this.vco.frequency);
            } else if (preset.mod === 'cutoff') {
                this.lfoGain.disconnect();
                this.lfoGain.connect(this.vcf.frequency);
            } else {
                this.lfoGain.disconnect();
            }
        }
    }
}

class Monotron extends Instrument {
    constructor(preset, audioContext) {
        super(Instruments.Monotron, audioContext)
        this.preset = {
            vco: {
                pitch: 33.3,
                knobPitch: 57
            },
            lfo: {
                rate: 5.2,
                int: 297,
                knobRate: 46,
                knobInt: 97
            },
            vcf: {
                cutoff: 393.3,
                peak: 16.6,
                knobCutoff: 72,
                knobPeak: 57
            },
            mod: 'pitch'
        }
    }

    noteOn(note, startTime) {
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            let currVoice = new MonotronVoise(noteToFrequency(note), startTime, this.preset, this.context);
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
        this.output.disconnect();
        this.output.connect(target);
    }

    disconnect() {
        this.output.disconnect();
    }

    updateNodes() {
        for (let i = 0; i < this.voices.length; i++) {
            if (!isNullOrUndefined(this.voices[i])) {
                this.voices[i].updatePreset(this.preset);
            }
        }
    }
}

export default Monotron;