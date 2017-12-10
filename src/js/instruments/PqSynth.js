import Store from '../stroe';
import { Instruments, keyFrequencies } from 'constants/Constants';
import { isNullOrUndefined } from 'engine/Utils';

class PqSynthVoice {
    constructor(freqyency) {
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;

            this.oscillator = this.context.createOscillator();
            this.output = this.context.createGain();

            this.oscillator.connect(this.output);

            this.output.gain.setValueAtTime(0.0001, this.context.currentTime);
            this.oscillator.type = 'square';
            this.oscillator.frequency.setValueAtTime(freqyency, this.context.currentTime);

            this.oscillator.start(this.context.currentTime);
        }
    }

    start(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(1.0, time + 0.1);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
        setTimeout(() => {
            this.oscillator.disconnect();
        }, Math.floor((time - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class PqSynth {
    constructor(preset = null) {
        this.name = Instruments.PqSynth.name;
        this.id = Instruments.PqSynth.id;
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
            let currVoice = new PqSynthVoice(frequency);
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

export default PqSynth;