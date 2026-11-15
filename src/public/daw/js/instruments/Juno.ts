import { Instruments } from '../constants/Constants';
import { devLog } from '../engine/Utils';
import { InstrumentBase } from './Instrument';
import { JunoPatch, defaultPatch } from './juno/JunoPatch';
import { JUNO_PROCESSOR, JUNO_WORKLET_URL, JunoMessage } from './juno/JunoMessages';

/**
 * Juno-106-style polysynth. The DSP (juno/JunoEngine.ts) runs in an
 * AudioWorklet; this class is the main-thread side: it loads the worklet once
 * per AudioContext, owns the AudioWorkletNode, and forwards timestamped note
 * and patch messages to it.
 *
 * The preset is a `JunoPatch` — plain numbers and booleans — so the store's
 * descriptor of it stays serializable.
 *
 * Notes can arrive before the worklet module has loaded (the first note after
 * adding the track); they are queued and flushed once the node exists.
 * Timestamps are AudioContext seconds, so a late flush plays such a note at
 * the start of the next render quantum rather than dropping it.
 */
const modules = new WeakMap<BaseAudioContext, Promise<void>>();

function loadModule(context: AudioContext): Promise<void> {
    let p = modules.get(context);
    if (!p) {
        p = context.audioWorklet.addModule(JUNO_WORKLET_URL);
        modules.set(context, p);
    }
    return p;
}

class Juno extends InstrumentBase {
    declare preset: JunoPatch;
    private node?: AudioWorkletNode;
    private pending: JunoMessage[] = [];
    private released = false;

    constructor(preset: Partial<JunoPatch> | undefined, audioContext: AudioContext) {
        super(Instruments.Juno, audioContext);
        this.preset = { ...defaultPatch, ...(preset ?? {}) };
        this.createNode();
    }

    /**
     * Builds the worklet node, loading the module first if this context has not
     * yet. A released instrument (disconnect) builds a fresh one on connect.
     */
    private createNode() {
        if (!this.context?.audioWorklet) {
            devLog('Juno: AudioWorklet unavailable in this context');
            return;
        }
        this.released = false;
        loadModule(this.context)
            .then(() => {
                if (this.released || this.node) return;
                this.node = new AudioWorkletNode(this.context, JUNO_PROCESSOR, {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [2],
                    processorOptions: { patch: this.preset },
                });
                this.node.connect(this.output);
                // The node was built with the current patch; earlier patch messages are stale.
                for (const msg of this.pending) if (msg.type !== 'patch') this.node.port.postMessage(msg);
                this.pending = [];
            })
            .catch((err) => console.error('Juno: failed to load the AudioWorklet module', err));
    }

    private post(msg: JunoMessage) {
        if (this.node) this.node.port.postMessage(msg);
        else this.pending.push(msg);
    }

    noteOn(note: number, startTime?: number) {
        this.post({ type: 'noteOn', note, time: startTime ?? this.context.currentTime });
    }

    noteOff(note: number, endTime?: number) {
        this.post({ type: 'noteOff', note, time: endTime ?? this.context.currentTime });
    }

    stopAll() {
        this.post({ type: 'allOff', time: this.context.currentTime });
    }

    updateNodes() {
        this.post({ type: 'patch', patch: { ...this.preset } });
    }

    connect(target: AudioNode) {
        this.output.disconnect();
        this.output.connect(target);
        if (this.released) this.createNode();
    }

    /**
     * Detaches the instrument and releases its worklet node. Every teardown
     * path (track removal, instrument swap, project load) ends here, and an
     * AudioWorkletNode whose processor returns true keeps running for as long
     * as it exists, so holding on to it would leak a render loop per discarded
     * instrument.
     */
    disconnect() {
        this.output.disconnect();
        this.released = true;
        this.pending = [];
        if (this.node) {
            this.node.port.postMessage({ type: 'allOff', time: 0 } satisfies JunoMessage);
            this.node.disconnect();
            this.node.port.close();
            this.node = undefined;
        }
    }
}

export default Juno;
