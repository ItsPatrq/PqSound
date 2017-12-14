import Store from '../stroe';
import { Instruments } from 'constants/Constants';
import { Presets } from 'constants/SamplerPresets';
import { isNullOrUndefined, MIDIToNote } from 'engine/Utils';

class SamplerVoice {
    constructor(buffer, startTime) {
        if (!isNullOrUndefined(Store)) {
            this.context = Store.getState().webAudio.context;

            this.source = this.context.createBufferSource();
            this.output = this.context.createGain();
            
            this.source.connect(this.output);
            this.output.gain.setValueAtTime(0.0001, startTime || this.context.currentTime);
            this.source.buffer = buffer;
            
            this.source.start(startTime || this.context.currentTime)
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
            this.source.disconnect();
        }, Math.floor((time - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class Sampler {
    constructor(preset = Presets.DSKGrandPiano) {
        this.name = Instruments.Sampler.name;
        this.id = Instruments.Sampler.id;
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
            let currVoice = new SamplerVoice(this.getBuffers(note), startTime);
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
        if(!isNullOrUndefined(this.preset.content[MIDIToNote(note)])){
            return this.preset.content[MIDIToNote(note)].name;
        } else {
            return 'No sample';
        }
    }


    connect(target) {
        this.output.connect(target);
    }

    /**
     * due to initializing web audio api at start of application and sampler is the default instrument
     */
    initContext() {
        this.context = Store.getState().webAudio.context;
        this.constructor();
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