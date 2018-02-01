import Store from '../stroe';
import { Instruments } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency } from 'engine/Utils';
import Instrument from './Instrument';

class MultiOscVoice {
    constructor(freqyency, startTime, preset) {
        if (!isNullOrUndefined(Store)) {
            this.preset = preset;
            this.context = Store.getState().webAudio.context;
            this.maxGain = 1 / preset.waveNumber;
            this.waves = new Array;
            this.output = this.context.createGain();

            for(let i = 0; i < preset.waveNumber; i++){
                let wave = this.context.createOscillator();
                wave.type = preset.oscilatorType;
                wave.frequency.setValueAtTime(freqyency, this.context.currentTime);
                wave.detune.setValueAtTime((-preset.detune + i * 2 * preset.detune / (preset.waveNumber - 1) | 0), this.context.currentTime);
                wave.start(startTime);
                wave.connect(this.output);
                this.waves.push(wave);
            }
        }
    }

    start(time, attack) {
        time = time || this.context.currentTime;
        this.output.gain.setValueAtTime(0.0001, time);
        this.output.gain.linearRampToValueAtTime(this.maxGain, time + attack);
    }

    stop(time, release) {
        time = time || this.context.currentTime;
        this.output.gain.setValueAtTime(this.maxGain, time);
        this.output.gain.linearRampToValueAtTime(0.0001, time + release);
        setTimeout(() => {
            for(let i = 0; i < this.waves.length; i++){
                this.waves[i].disconnect();
            }
        }, Math.floor((time + release - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class MultiOsc extends Instrument{
    constructor(preset = null) {
        super(Instruments.MultiOsc)
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;
            this.output = this.context.createGain();
        }
        this.preset = preset ? preset : {
            waveNumber: 3,
            detune: 12,
            attack: 0,
            release: 0.5,
            oscilatorType: 'sawtooth'
        }
    }

    noteOn(note, startTime) {
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            let currVoice = new MultiOscVoice(noteToFrequency(note), startTime, this.preset);
            currVoice.connect(this.output);
            currVoice.start(startTime, this.preset.attack);
            this.voices[note] = currVoice;
        }
    }

    noteOff(note, endTime) {
        if (!isNullOrUndefined(this.voices[note])) {
            endTime = endTime || this.context.currentTime;
            this.voices[note].stop(endTime, this.preset.release);
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

export default MultiOsc;