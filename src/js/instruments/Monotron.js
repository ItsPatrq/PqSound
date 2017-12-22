import Store from '../stroe';
import { Instruments, defaultKeysNames } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency, MIDIToNote } from 'engine/Utils';
import {updateInstrumentPreset} from 'actions/trackListActions';

class MonotronVoise {
    constructor(frequency, startTime, preset) {
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
            if(preset.mod === 'pitch'){
                this.lfoGain.connect(this.vco.frequency);
            } else if(preset.mod === 'cutoff'){
                this.lfoGain.connect(this.vcf.frequency);
            }

            this.output.gain.setValueAtTime(0.0001, startTime || this.context.currentTime);
            this.vco.type = 'sawtooth'
            this.lfo.type = 'sawtooth'
            this.vco.frequency.setValueAtTime(frequency + preset.vco.pitch, startTime || this.context.currentTime);
            this.lfo.frequency.setValueAtTime(preset.lfo.rate, startTime || this.context.currentTime);
            this.lfoGain.gain.setValueAtTime(preset.lfo.int, startTime || this.context.currentTime);
            this.vcf.frequency.setValueAtTime(preset.vcf.cutoff, startTime || this.context.currentTime);
            this.vcf.Q.setValueAtTime(preset.vcf.peak, startTime || this.context.currentTime);

            this.vco.start(startTime || this.context.currentTime);
            this.lfo.start(startTime || this.context.currentTime);
        }
    }

    start(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(0.7, time + 0.05);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
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

    updatePreset(newValue, preset){
        switch(preset){
            case 'pitch':{
                this.vco.frequency.setValueAtTime(this.frequency + newValue, this.context.currentTime);
                break;
            }
            case 'rate':{
                this.lfo.frequency.setValueAtTime(newValue, this.context.currentTime);
                break;
            }
            case 'int':{
                this.lfoGain.gain.setValueAtTime(newValue, this.context.currentTime);
                break;
            }
            case 'cutoff':{
                this.vcf.frequency.setValueAtTime(newValue, this.context.currentTime);
                break;
            }
            case 'peak':{
                this.vcf.Q.setValueAtTime(newValue, this.context.currentTime);
                break;
            }
            case 'mod':{
                if(newValue === 'pitch'){
                    this.lfoGain.disconnect();
                    this.lfoGain.connect(this.vco.frequency);
                } else if(newValue === 'cutoff'){
                    this.lfoGain.disconnect();
                    this.lfoGain.connect(this.vcf.frequency);
                } else {
                    this.lfoGain.disconnect();
                }
                break;
            }
        }
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
        this.preset = {
            vco: {
                pitch: 33.3,
                knobPitch: 57
            },
            lfo: {
                rate: 5.2,
                int: 432,
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
            let currVoice = new MonotronVoise(noteToFrequency(note), startTime, this.preset);
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
        this.output.disconnect();
        this.output.connect(target);
    }

    disconnect(){
        this.output.disconnect();
    }

    updatePreset(newValue, newKnobValue, preset, trackIndex){
        switch(preset){
            case 'pitch':{
                this.preset.vco.pitch = newValue;
                this.preset.vco.knobPitch = newKnobValue;
                break;
            }
            case 'rate':{
                this.preset.lfo.rate = newValue;
                this.preset.lfo.knobRate = newKnobValue;
                break;
            }
            case 'int':{
                this.preset.lfo.int = newValue;
                this.preset.lfo.knobInt = newKnobValue;
                break;
            }
            case 'cutoff':{
                this.preset.vcf.cutoff = newValue;
                this.preset.vcf.knobCutoff = newKnobValue;
                break;
            }
            case 'peak':{
                this.preset.vcf.peak = newValue;
                this.preset.vcf.knobPeak = newKnobValue;
                break;
            }
            case 'mod':{
                this.preset.mod = newValue;
                break;
            }
        }
        for(let i = 0; i < this.voices.length; i++){
            if(!isNullOrUndefined(this.voices[i])){
                this.voices[i].updatePreset(newValue, preset);
            }
        }
        Store.dispatch(updateInstrumentPreset(this.preset, trackIndex));
    }
}

export default Monotron;