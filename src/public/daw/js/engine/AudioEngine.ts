import Sound from './Sound';
// Type-only: erased at compile time, so registering these here does not create
// an import cycle with the modules that construct them.
import type Sequencer from './Sequencer';
import type MIDIController from './MIDIController';
import type Track from './Track';

/**
 * Teardown helpers. Dropping a registry entry does not detach anything — the
 * Web Audio graph is itself an owning reference, so a node stays alive and
 * audible for as long as it is connected. The engine therefore disconnects on
 * the way out rather than leaving it to each caller, which is how the leaks in
 * #249 accumulated. Disconnecting twice is a no-op, so these are idempotent.
 */
const disposeInstrument = (instrument: any): void => {
    instrument?.stopAll?.();
    instrument?.disconnect?.();
};

const disposePlugin = (plugin: any): void => {
    // PluginBase.dispose releases the plugin's whole internal graph and stops
    // any scheduled source; input/output alone left Chorus's LFO running (#276).
    if (typeof plugin?.dispose === 'function') {
        plugin.dispose();
        return;
    }
    plugin?.input?.disconnect?.();
    plugin?.output?.disconnect?.();
};

/**
 * Owns every live, non-serializable object that used to sit inside store state:
 * the `AudioContext`, the `Sound` dispatcher and the decoded sample buffers
 * (from `webAudioSlice`), plus the `Sequencer` and `MIDIController`
 * singletons (from `controlSlice`).
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
     * Live per-track Web Audio graphs, keyed by the track's stable `id` — not
     * by its index, which is renumbered whenever a track is removed or
     * reordered.
     */
    private trackNodes: Map<number, Track> = new Map();
    /** Live instruments, keyed by the same stable track id as the graphs. */
    private instruments: Map<number, any> = new Map();
    /**
     * Live plugin chains, keyed by track id. The engine owns the array
     * instance: a track's Track node holds the same reference as its
     * `pluginNodeList`, so mutating it in place is what the node sees on
     * `refreshTrackNode`. Never replace an entry's array — mutate it.
     */
    private plugins: Map<number, any[]> = new Map();

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

    /* ---- track graphs and instruments ---- */

    setInstrument(trackId: number, instrument: any): void {
        if (instrument === null || instrument === undefined) {
            this.instruments.delete(trackId);
            return;
        }
        this.instruments.set(trackId, instrument);
    }

    getInstrument(trackId: number): any {
        return this.instruments.get(trackId);
    }

    removeInstrument(trackId: number): void {
        disposeInstrument(this.instruments.get(trackId));
        this.instruments.delete(trackId);
    }

    clearInstruments(): void {
        this.instruments.forEach(disposeInstrument);
        this.instruments.clear();
    }

    /**
     * Registers (and returns) the live plugin array for a track. The same
     * instance must be handed to the track's Track node.
     */
    setPlugins(trackId: number, plugins: any[]): any[] {
        this.plugins.set(trackId, plugins);
        return plugins;
    }

    getPlugins(trackId: number): any[] {
        return this.plugins.get(trackId) || [];
    }

    /** Appends to the existing array so the Track node sees the new plugin. */
    addPlugin(trackId: number, plugin: any): void {
        const plugins = this.plugins.get(trackId);
        if (plugins) {
            plugins.push(plugin);
        } else {
            this.plugins.set(trackId, [plugin]);
        }
    }

    /** Removes by the plugin's own `index` and renumbers the ones after it. */
    removePlugin(trackId: number, pluginIndex: number): void {
        const plugins = this.plugins.get(trackId);
        if (!plugins) {
            return;
        }
        const position = plugins.findIndex((plugin) => plugin.index === pluginIndex);
        if (position === -1) {
            return;
        }
        // Detach before splicing: updateTrackNode only disconnects plugins still
        // in the list, so a removed one would keep its edge into the next
        // plugin's input and its nodes would stay live (#249).
        disposePlugin(plugins[position]);
        plugins.splice(position, 1);
        for (let i = position; i < plugins.length; i++) {
            plugins[i].index = i;
        }
    }

    updatePluginPreset(trackId: number, pluginIndex: number, preset: any): void {
        const plugin = this.getPlugins(trackId).find((curr) => curr.index === pluginIndex);
        if (plugin) {
            plugin.updatePreset(preset);
        }
    }

    removePlugins(trackId: number): void {
        (this.plugins.get(trackId) || []).forEach(disposePlugin);
        this.plugins.delete(trackId);
    }

    clearPlugins(): void {
        this.plugins.forEach((plugins) => plugins.forEach(disposePlugin));
        this.plugins.clear();
    }

    setTrackNode(trackId: number, node: Track): void {
        this.trackNodes.set(trackId, node);
    }

    getTrackNode(trackId: number): Track | undefined {
        return this.trackNodes.get(trackId);
    }

    removeTrackNode(trackId: number): void {
        this.trackNodes.get(trackId)?.dispose();
        this.trackNodes.delete(trackId);
    }

    clearTrackNodes(): void {
        this.trackNodes.forEach((node) => node.dispose());
        this.trackNodes.clear();
    }

    /**
     * Per-node operations. They are no-ops for an unknown id so callers do not
     * have to guard against a track whose graph has not been built yet (the
     * store is populated before `INIT_INSTRUMENT_CONTEXT` runs).
     */
    applyTrackVolume(trackId: number, volume: number): void {
        this.trackNodes.get(trackId)?.changeVolume(volume);
    }

    applyTrackPan(trackId: number, pan: number): void {
        this.trackNodes.get(trackId)?.changePan(pan);
    }

    applyTrackMute(trackId: number): void {
        this.trackNodes.get(trackId)?.updateMuteState();
    }

    applyTrackSolo(trackId: number, solo: boolean, anySolo: boolean): void {
        this.trackNodes.get(trackId)?.updateSoloState(solo, anySolo);
    }

    applyTrackInstrument(trackId: number, instrument: any): void {
        this.trackNodes.get(trackId)?.updateInstrument(instrument);
    }

    /**
     * Rebuilds a track's plugin chain, optionally re-pointing it at a new
     * destination input node.
     */
    refreshTrackNode(trackId: number, destinationInput?: AudioNode): void {
        this.trackNodes.get(trackId)?.updateTrackNode(destinationInput);
    }

    /** Test seam: drops every live object the engine owns. */
    reset(): void {
        this.context = null;
        this.sound = null;
        this.sequencer = null;
        this.midiController = null;
        this.buffersByInstrumentName.clear();
        this.trackNodes.clear();
        this.instruments.clear();
        this.plugins.clear();
    }
}

const audioEngine = new AudioEngine();

export default audioEngine;
