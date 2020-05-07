import { Instruments } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency } from 'engine/Utils';
import Instrument from './Instrument';

class PqSynthVoice {
    constructor(note, startTime, preset, audioContext) {
        if (!isNullOrUndefined(audioContext)) {
            this.context = audioContext;
            this.oscillator = this.context.createOscillator();
            this.output = this.context.createGain();
            this.output.gain.setValueAtTime(0.0001, startTime || this.context.currentTime);
            this.oscillatorsConstructor(note, preset, startTime);
            this.oscillatorsOutput.connect(this.output);
            this.preset = preset;
        }
    }

    oscillatorsConstructor(note, preset/*, startTime*/) {
        this.oscillatorsOutput = this.context.createGain();
        this.oscillators = [{}, {}, {}];
        for (let i = 0; i < preset.oscillators.length; i++) {
            if (preset.oscillators[i].active) {
                if (preset.oscillators[i].waveForm === 'whiteNoise') {
                    let bufferSize = 2 * this.context.sampleRate,
                        noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate),
                        output = noiseBuffer.getChannelData(0);
                    for (let j = 0; j < bufferSize; j++) {
                        output[j] = Math.random() * 2 - 1;
                    }

                    this.oscillators[i].source = this.context.createBufferSource();
                    this.oscillators[i].source.buffer = noiseBuffer;
                    this.oscillators[i].source.loop = true;
                    this.oscillators[i].source.start(0);
                } else if(preset.oscillators[i].waveForm === 'pinkNoise'){
                    let bufferSize = 2 * this.context.sampleRate,
                        noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate),
                        output = noiseBuffer.getChannelData(0),
                        b0, b1, b2, b3, b4, b5, b6;
                    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                    for (let j = 0; j < bufferSize; j++) {
                        let white = Math.random() * 2 - 1;
                            b0 = 0.99886 * b0 + white * 0.0555179;
                            b1 = 0.99332 * b1 + white * 0.0750759;
                            b2 = 0.96900 * b2 + white * 0.1538520;
                            b3 = 0.86650 * b3 + white * 0.3104856;
                            b4 = 0.55000 * b4 + white * 0.5329522;
                            b5 = -0.7616 * b5 - white * 0.0168980;
                            output[j] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                            output[j] *= 0.11; // (roughly) compensate for gain
                            b6 = white * 0.115926;
                    }
                    this.oscillators[i].source = this.context.createBufferSource();
                    this.oscillators[i].source.buffer = noiseBuffer;
                    this.oscillators[i].source.loop = true;
                    this.oscillators[i].source.start(0);
                } else if(preset.oscillators[i].waveForm === 'brownianNoise'){
                    let bufferSize = 2 * this.context.sampleRate,
                    noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate),
                    output = noiseBuffer.getChannelData(0),
                    lastOut = 0.0;
                    for (let j = 0; j < bufferSize; j++) {
                        var white = Math.random() * 2 - 1;
                        output[j] = (lastOut + (0.02 * white)) / 1.02;
                        lastOut = output[j];
                        output[i] *= 3.5; // (roughly) compensate for gain
                    }
                    this.oscillators[i].source = this.context.createBufferSource();
                    this.oscillators[i].source.buffer = noiseBuffer;
                    this.oscillators[i].source.loop = true;
                    this.oscillators[i].source.start(0);
                } else {
                    this.oscillators[i].source = this.context.createOscillator();
                    this.oscillators[i].source.type = preset.oscillators[i].waveForm;
                    let frequency = noteToFrequency(note + preset.oscillators[i].frequencyModOct * 12 + preset.oscillators[i].frequencyModPercent / 12)
                    this.oscillators[i].source.frequency.setValueAtTime(frequency, this.context.currentTime);
                    this.oscillators[i].source.start();

                    if (preset.oscillators[i].frequencyModLfo) {
                        this.oscillators[i].fqLfoModifier = this.context.createOscillator();
                        this.oscillators[i].fqLfoModifier.type = 'sine';
                        this.oscillators[i].fqLfoModifier.frequency.setValueAtTime(preset.oscillators[i].frequencyModLfoHz, this.context.currentTime);
                        this.oscillators[i].widthFqLfoModifier = this.context.createGain();
                        this.oscillators[i].widthFqLfoModifier.gain.setValueAtTime(preset.oscillators[i].frequencyModLfoWidth, this.context.currentTime);
                        this.oscillators[i].fqLfoModifier.connect(this.oscillators[i].widthFqLfoModifier);
                        this.oscillators[i].fqLfoModifier.start();
                        this.oscillators[i].widthFqLfoModifier.connect(this.oscillators[i].source.frequency);
                    }
                }

                this.oscillators[i].baseAplitude = this.context.createGain();
                this.oscillators[i].source.connect(this.oscillators[i].baseAplitude);
                this.oscillators[i].baseAplitude.gain.setValueAtTime(preset.oscillators[i].amplitudeModPercent / 100, this.context.currentTime);
                if (preset.oscillators[i].amplitudeModLfo) {
                    this.oscillators[i].amplitudeLfoModifier = this.context.createOscillator();
                    this.oscillators[i].amplitudeLfoModifier.type = 'sine';
                    this.oscillators[i].amplitudeLfoModifier.frequency.setValueAtTime(preset.oscillators[i].amplitudeModLfoHz, this.context.currentTime);
                    this.oscillators[i].widthAmplitudeLfoModifier = this.context.createGain();
                    this.oscillators[i].widthAmplitudeLfoModifier.gain.setValueAtTime(preset.oscillators[i].amplitudeModLfoWidth, this.context.currentTime);
                    this.oscillators[i].amplitudeLfoModifier.connect(this.oscillators[i].widthAmplitudeLfoModifier);
                    this.oscillators[i].amplitudeLfoModifier.start();
                    this.oscillators[i].widthAmplitudeLfoModifier.connect(this.oscillators[i].baseAplitude.gain);
                }

                this.oscillators[i].baseAplitude.connect(this.oscillatorsOutput);
            }
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
            for (let i = 0; i < this.preset.oscillators.length; i++) {
                if (this.preset.oscillators[i].active) {
                    if (this.preset.oscillators[i].waveForm === 'whiteNoise' ||
                        this.preset.oscillators[i].waveForm === 'pinkNoise' ||
                        this.preset.oscillators[i].waveForm === 'brownianNoise'
                    ) {

                    } else {
                        this.oscillators[i].source.disconnect();
                        if (this.preset.oscillators[i].frequencyModLfo) {
                            this.oscillators[i].fqLfoModifier.disconnect();
                            this.oscillators[i].widthFqLfoModifier.disconnect();
                        }
                    }
                    if (this.preset.oscillators[i].amplitudeModLfo) {
                        this.oscillators[i].amplitudeLfoModifier.disconnect();
                        this.oscillators[i].widthAmplitudeLfoModifier.disconnect();
                    }
                }
            }
        }, Math.floor((time - this.context.currentTime) * 1000));
    }

    connect(target) {
        this.output.connect(target);
    }
}

class PqSynth extends Instrument {
    constructor(preset = null, audioContext = null) {
        super(Instruments.PqSynth, audioContext)
        this.preset = preset;
        this.preset = {
            oscillators: [
                {
                    active: true,
                    waveForm: 'sine',
                    frequencyModPercent: 0,
                    frequencyModOct: 0,
                    frequencyModLfo: false,
                    frequencyModLfoHz: 0.10,
                    frequencyModLfoWidth: 0.01,
                    amplitudeModPercent: 100,
                    amplitudeModLfo: false,
                    amplitudeModLfoHz: 0.10,
                    amplitudeModLfoWidth: 0.01
                },
                {
                    active: false,
                    waveForm: 'triangle',
                    frequencyModPercent: 0,
                    frequencyModOct: 0,
                    frequencyModLfo: false,
                    frequencyModLfoHz: 0.10,
                    frequencyModLfoWidth: 0.01,
                    amplitudeModPercent: 100,
                    amplitudeModLfo: false,
                    amplitudeModLfoHz: 0.10,
                    amplitudeModLfoWidth: 0.01
                },
                {
                    active: false,
                    waveForm: 'saw',
                    frequencyModPercent: 0,
                    frequencyModOct: 0,
                    frequencyModLfo: false,
                    frequencyModLfoHz: 0.10,
                    frequencyModLfoWidth: 0.01,
                    amplitudeModPercent: 100,
                    amplitudeModLfo: false,
                    amplitudeModLfoHz: 0.10,
                    amplitudeModLfoWidth: 0.01
                }
            ]
        }
    }

    noteOn(note, startTime) {
        if (isNullOrUndefined(this.voices[note])) {
            startTime = startTime || this.context.currentTime;
            let currVoice = new PqSynthVoice(note, startTime, this.preset, this.context);
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

    disconnect() {
        this.output.disconnect();
    }
}

export default PqSynth;