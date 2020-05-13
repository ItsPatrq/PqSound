import Store from '../stroe';
import { Instruments } from '../constants/Constants';
import { Presets } from '../constants/SamplerPresets';
import { isNullOrUndefined, MIDIToNote, devLog } from '../engine/Utils';
import { InstrumentBase } from './Instrument';
import { VoiceSynthBase } from './Voice';
class SamplerVoice extends VoiceSynthBase {
    updatePreset(preset: any) {
        console.warn('Method not implemented.');
    }
    output: GainNode;
    source: AudioBufferSourceNode;

    constructor(buffer: AudioBuffer, preset: any, audioContext: AudioContext) {
        super(audioContext, preset);
        this.source = this.context.createBufferSource();
        this.output = this.context.createGain();

        this.source.connect(this.output);
        this.source.buffer = buffer;
    }

    start(time) {
        time = time || this.context.currentTime;
        this.source.start(time);
        this.output.gain.setValueAtTime(0.00001, time);
        this.output.gain.linearRampToValueAtTime(1.0, time + this.preset.attack);
    }

    stop(time) {
        time = time || this.context.currentTime;
        this.output.gain.setValueAtTime(1, time);
        this.output.gain.linearRampToValueAtTime(0.00001, time + this.preset.release + 0.001);
        setTimeout(() => {
            this.source.disconnect();
        }, Math.floor((time + this.preset.release - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class Sampler extends InstrumentBase {
    updateNodes(): void {
        throw new Error('Method not implemented.');
    }
    constructor(preset = Presets.DSKGrandPiano, audioContext) {
        super(Instruments.Sampler, audioContext);
        this.preset = preset;
        this.preset.attack = 0;
        this.preset.release = 0;
    }

    noteOn(note, startTime) {
        console.log(this);
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            const currVoice = new SamplerVoice(this.getBuffers(note), this.preset, this.context);
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

    getNoteName(note) {
        if (!isNullOrUndefined(this.preset.content[MIDIToNote(note)])) {
            return this.preset.content[MIDIToNote(note)].name;
        } else {
            return 'No sample';
        }
    }

    connect(target) {
        this.disconnect();
        this.output.connect(target);
    }

    disconnect() {
        this.output.disconnect();
    }

    loadPreset(newPreset) {
        this.preset = newPreset;
    }

    getBuffers(note) {
        const samplerInstruments = (Store.getState().webAudio as any).samplerInstrumentsSounds;
        for (let i = 0; i < samplerInstruments.length; i++) {
            if (samplerInstruments[i].name === this.preset.name) {
                return samplerInstruments[i].buffer[MIDIToNote(note)];
            }
        }
    }
}

export default Sampler;
