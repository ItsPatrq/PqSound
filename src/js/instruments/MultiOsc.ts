import { Instruments } from '../constants/Constants';
import { isNullOrUndefined, noteToFrequency } from '../engine/Utils';
import {InstrumentBase} from './Instrument';
import {VoiceSynthBase} from './Voice';
class MultiOscVoice extends VoiceSynthBase {
    maxGain: number;
    waves: any[];
    output: GainNode;
    updatePreset(preset: any) {
        console.warn("Method not implemented.");
    }
    constructor(freqyency:number, startTime:number, preset:any, audioContext:AudioContext) {
        super(audioContext, preset);
        this.preset = preset;
        this.context = audioContext;
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

    start(time) {
        time = time || this.context.currentTime;
        this.output.gain.setValueAtTime(0.0001, time);
        this.output.gain.linearRampToValueAtTime(this.maxGain, time + this.preset.attack);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.setValueAtTime(this.maxGain, time);
        this.output.gain.linearRampToValueAtTime(0.0001, time + this.preset.release);
        setTimeout(() => {
            for(let i = 0; i < this.waves.length; i++){
                this.waves[i].disconnect();
            }
        }, Math.floor((time + this.preset.release - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class MultiOsc extends InstrumentBase{
    updateNodes(): void {
        console.warn("Method not implemented.");
    }
    constructor(preset, audioContext:AudioContext) {
        super(Instruments.MultiOsc, audioContext)
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
            let currVoice = new MultiOscVoice(noteToFrequency(note), startTime, this.preset, this.context);
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

export default MultiOsc;