import Store from '../stroe';
import { Instruments } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency } from 'engine/Utils';
import Instrument from './Instrument';

class MultiSawVoice {
    constructor(freqyency, startTime, preset) {
        if (!isNullOrUndefined(Store)) {
            this.preset = preset;
            this.context = Store.getState().webAudio.context;
            this.maxGain = 1 / preset.sawNumber;
            this.saws = new Array;
            this.output = this.context.createGain();
            this.output.gain.setValueAtTime(0.0001, this.context.currentTime);

            for(let i = 0; i < preset.sawNumber; i++){
                let saw = this.context.createOscillator();
                saw.type = 'sawtooth';
                saw.frequency.setValueAtTime(freqyency, this.context.currentTime);
                saw.detune.setValueAtTime(-preset.detune + i * 2 * preset.detune / (preset.sawNumber - 1), this.context.currentTime);
                saw.start(this.context.currentTime);
                saw.connect(this.output);
                this.saws.push(saw);
            }
        }
    }

    start(time) {
        time = time || this.context.currentTime;
        this.output.gain.linearRampToValueAtTime(this.maxGain, time + this.preset.attack);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.linearRampToValueAtTime(0.0001, time + this.preset.release);
        setTimeout(() => {
            for(let i = 0; i < this.saws.length; i++){
                this.saws[i].disconnect();
            }
        }, Math.floor((time - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class MultiSaw extends Instrument{
    constructor(preset = null) {
        super(Instruments.MultiSaw)
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;
            this.output = this.context.createGain();
            this.voices = new Array;
        }
        this.preset = preset ? preset : {
            sawNumber: 3,
            detune: 12,
            attack: 0,
            release: 0
        }
    }

    noteOn(note, startTime) {
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            let currVoice = new MultiSawVoice(noteToFrequency(note), startTime, this.preset);
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

    disconnect(){
        this.output.disconnect();
    }
}

export default MultiSaw;