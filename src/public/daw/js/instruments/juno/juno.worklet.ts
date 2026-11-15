/**
 * AudioWorklet processor hosting JunoEngine. Built as its own bundle
 * (src/webpackCfg/worklet.ts → /assets/juno-worklet.js) because the worklet
 * scope has no `window`, `self` or HMR runtime.
 *
 * Messages are timestamped in AudioContext seconds, so notes the sequencer
 * schedules ahead (its lookahead is 0.2 s) start on the exact sample.
 */
import { JunoEngine } from './JunoEngine';
import { JunoPatch } from './JunoPatch';
import { JUNO_PROCESSOR, JunoMessage } from './JunoMessages';

declare const sampleRate: number;
declare const currentFrame: number;
declare function registerProcessor(name: string, ctor: unknown): void;
declare class AudioWorkletProcessor {
    readonly port: MessagePort;
    constructor(options?: unknown);
}

class JunoProcessor extends AudioWorkletProcessor {
    private engine: JunoEngine;
    private queue: JunoMessage[] = [];

    constructor(options: { processorOptions: { patch: JunoPatch } }) {
        super(options);
        this.engine = new JunoEngine(sampleRate, options.processorOptions.patch);
        this.port.onmessage = (e: MessageEvent<JunoMessage>) => this.enqueue(e.data);
    }

    private enqueue(msg: JunoMessage) {
        if (msg.type === 'patch') {
            this.engine.setPatch(msg.patch);
            return;
        }
        const at = msg.time;
        let i = this.queue.length;
        while (i > 0 && (this.queue[i - 1] as { time: number }).time > at) i--;
        this.queue.splice(i, 0, msg);
    }

    private apply(msg: JunoMessage) {
        if (msg.type === 'noteOn') this.engine.noteOn(msg.note);
        else if (msg.type === 'noteOff') this.engine.noteOff(msg.note);
        else if (msg.type === 'allOff') this.engine.allNotesOff();
    }

    process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
        const out = outputs[0];
        const left = out[0];
        const right = out[1] ?? out[0];
        const frames = left.length;
        let pos = 0;
        while (this.queue.length) {
            const next = this.queue[0] as { time: number };
            const at = Math.round(next.time * sampleRate) - currentFrame;
            if (at >= frames) break;
            const offset = Math.max(0, at);
            if (offset > pos) {
                this.engine.process(left, right, pos, offset - pos);
                pos = offset;
            }
            this.apply(this.queue.shift()!);
        }
        if (pos < frames) this.engine.process(left, right, pos, frames - pos);
        return true;
    }
}

registerProcessor(JUNO_PROCESSOR, JunoProcessor);
