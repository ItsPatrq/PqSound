import Sound from './Sound';
// Type-only: erased at compile time, so registering these here does not create
// an import cycle with the modules that construct them.
import type Sequencer from './Sequencer';
import type MIDIController from './MIDIController';

/**
 * Owns every live, non-serializable object that used to sit inside store state:
 * the `AudioContext`, the `Sound` dispatcher and the decoded sample buffers
 * (from `webAudioReducer`), plus the `Sequencer` and `MIDIController`
 * singletons (from `controlReducer`).
 *
 * The store now keeps only serializable descriptors (`initialized`,
 * `sampleRate`, and per-instrument `loaded`/`fetching` flags) and points at
 * this module for the real objects. Reducers stay pure; the engine is reached
 * imperatively from thunks, containers and the other engine classes.
 *
 * Single instance, exported as the module default.
 */
class AudioEngine {
    private context: AudioContext | null = null;
    private sound: Sound | null = null;
    /** instrument name -> decoded buffers, indexed by note as in `Sampler.getBuffers`. */
    private buffersByInstrumentName: Map<string, AudioBuffer[]> = new Map();
    private sequencer: Sequencer | null = null;
    private midiController: MIDIController | null = null;

    /**
     * Creates the AudioContext and the Sound dispatcher. Idempotent: a second
     * call keeps the existing context. Returns false when Web Audio is
     * unavailable, leaving the engine uninitialized.
     */
    init(): boolean {
        if (this.context) {
            return true;
        }
        try {
            this.context = new AudioContext();
            this.sound = new Sound(this.context);
            return true;
        } catch (e) {
            //TODO: surface this in an error panel instead of the console
            console.error('Web Audio API is not supported in this browser', e);
            this.context = null;
            this.sound = null;
            return false;
        }
    }

    isInitialized(): boolean {
        return this.context !== null;
    }

    /**
     * The live AudioContext, or null before `init()` (or when Web Audio is
     * unsupported). Callers that already ran through `Main`'s init path can
     * treat it as present.
     */
    getContext(): AudioContext | null {
        return this.context;
    }

    getSampleRate(): number | null {
        return this.context ? this.context.sampleRate : null;
    }

    getSound(): Sound | null {
        return this.sound;
    }

    /** Resumes a context suspended by the browser autoplay policy. */
    resume(): void {
        if (this.context && this.context.state !== 'running') {
            this.context.resume();
        }
    }

    setInstrumentBuffers(instrumentName: string, buffers: AudioBuffer[]): void {
        this.buffersByInstrumentName.set(instrumentName, buffers);
    }

    getInstrumentBuffers(instrumentName: string): AudioBuffer[] | undefined {
        return this.buffersByInstrumentName.get(instrumentName);
    }

    /**
     * The transport. Created by the app shell at mount (it needs a Worker and a
     * live context) and registered here so containers and thunks can reach it
     * without the store carrying the instance.
     */
    setSequencer(sequencer: Sequencer): void {
        this.sequencer = sequencer;
    }

    getSequencer(): Sequencer | null {
        return this.sequencer;
    }

    setMidiController(midiController: MIDIController): void {
        this.midiController = midiController;
    }

    getMidiController(): MIDIController | null {
        return this.midiController;
    }

    /** Test seam: drops every live object the engine owns. */
    reset(): void {
        this.context = null;
        this.sound = null;
        this.sequencer = null;
        this.midiController = null;
        this.buffersByInstrumentName.clear();
    }
}

const audioEngine = new AudioEngine();

export default audioEngine;
