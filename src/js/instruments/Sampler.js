import Store from '../stroe';
import { Instruments } from 'constants/Constants';
import { Presets } from 'constants/SamplerPresets';
import { isNullOrUndefined, MIDIToNote, devLog } from 'engine/Utils';
import Instrument from './Instrument';

class SamplerVoice {
    constructor(buffer, audioContext) {
        if (!isNullOrUndefined(audioContext)) {
            this.context = audioContext;
            this.source = this.context.createBufferSource();
            this.output = this.context.createGain();
            
            this.source.connect(this.output);
            this.source.buffer = buffer;
        } else {
            devLog("Sampler play error - no audioContext")
        }
    }

    start(time, attack) {
        time = time || this.context.currentTime;
        this.source.start(time);
        this.output.gain.setValueAtTime(0.00001, time);
        this.output.gain.linearRampToValueAtTime(1.0, time + attack);
    }

    stop(time, release) {
        time = time || this.context.currentTime;
        this.output.gain.setValueAtTime(1, time);
        this.output.gain.linearRampToValueAtTime(0.00001, time + release + 0.001);
        setTimeout(() => {
            this.source.disconnect();
        }, Math.floor((time + release - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class Sampler extends Instrument{
    constructor(preset = Presets.DSKGrandPiano, audioContext) {
        super(Instruments.Sampler, audioContext);
        this.preset = preset;
        this.preset.attack = 0;
        this.preset.release = 0;
    }

    noteOn(note, startTime) {
        console.log(this)
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            let currVoice = new SamplerVoice(this.getBuffers(note), this.context);
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

    getNoteName(note){
        if(!isNullOrUndefined(this.preset.content[MIDIToNote(note)])){
            return this.preset.content[MIDIToNote(note)].name;
        } else {
            return 'No sample';
        }
    }


    connect(target) {
        this.disconnect();
        this.output.connect(target);
    }

    disconnect(){
        this.output.disconnect();
    }

    /**
     * due to initializing web audio api at start of application and sampler is the default instrument
     */
    initContext(audioContext) {
        this.context = audioContext;
        this.constructor(undefined, audioContext);
    }

    loadPreset(newPreset){
        this.preset = newPreset;
    }

    updateNodes(){
        
    }

    getBuffers(note) {
        let samplerInstruments = Store.getState().webAudio.samplerInstrumentsSounds;
        for (let i = 0; i < samplerInstruments.length; i++) {
            if (samplerInstruments[i].name === this.preset.name) {
                return samplerInstruments[i].buffer[MIDIToNote(note)];
            }
        }
    }
}

export default Sampler;