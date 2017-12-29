import Store from '../stroe';
import { Instruments, defaultKeysNames } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency, MIDIToNote } from 'engine/Utils';

class PqSynthVoice {
    constructor(freqyency, startTime) {
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;

            this.oscillator = this.context.createOscillator();
            this.output = this.context.createGain();

            this.oscillator.connect(this.output);

            this.output.gain.setValueAtTime(0.0001, startTime || this.context.currentTime);
            this.oscillator.type = 'square';
            this.oscillator.frequency.setValueAtTime(freqyency, startTime || this.context.currentTime);

            this.oscillator.start(startTime || this.context.currentTime);
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
            let currVoice = new PqSynthVoice(noteToFrequency(note), startTime);
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

    getNoteName(note){
        return defaultKeysNames[MIDIToNote(note)] + Math.ceil((MIDIToNote(note) - 2)/12);
    }

    connect(target) {
        this.output.connect(target);
    }

    disconnect(){
        this.output.disconnect();
    }
}

export default PqSynth;