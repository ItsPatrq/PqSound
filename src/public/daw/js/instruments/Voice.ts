import { isNullOrUndefined } from '../engine/Utils';

export interface Voice {
    context: AudioContext;
    preset: any;
    output: AudioNode;
    start(time: number);
    stop(time: number);
    connect(target: AudioNode);
    updatePreset(newPreset: any);
}

export abstract class VoiceSynthBase implements Voice {
    constructor(audioContext: AudioContext, preset: any) {
        if (!isNullOrUndefined(audioContext)) {
            this.context = audioContext;
            this.preset = preset;
        }
    }
    abstract start(time: number);
    abstract stop(time: number);
    abstract connect(target: AudioNode);
    abstract updatePreset(preset: any);

    /**
     * Schedules a voice's teardown for when its release ramp has finished, and
     * releases the voice's own output node afterwards.
     *
     * Every voice used to disconnect its internal nodes and leave `output`
     * connected to the instrument. The Web Audio graph is an owning reference,
     * so `noteOff`'s `delete this.voices[note]` dropped the last JS handle while
     * the whole subgraph stayed live and traversed every render quantum — one
     * leaked gain node per note played (#266).
     *
     * The delay is clamped: for a stop scheduled in the past the old expression
     * went negative and fired immediately, cutting the voice mid-ramp.
     */
    protected releaseNodes(time: number, release: number, teardown: () => void): void {
        const delayMs = Math.max(0, Math.floor((time + release - this.context.currentTime) * 1000));
        setTimeout(() => {
            teardown();
            this.output?.disconnect();
        }, delayMs);
    }

    /**
     * Stops a scheduled source node. Calling stop() on one that never started —
     * or twice — throws InvalidStateError, and a voice being torn down is not
     * worth failing over.
     */
    protected stopSource(node: { stop?: (when?: number) => void } | undefined | null, when?: number): void {
        try {
            node?.stop?.(when);
        } catch {
            // already stopped, or never started
        }
    }

    declare context: AudioContext;
    declare preset: any;
    declare output: AudioNode;
}
