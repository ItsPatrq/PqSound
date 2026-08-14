import { Plugins, PluginsEnum } from '../constants/Constants';

export interface Plugin {
    name: string;
    id: number;
    index: number;
    context: AudioContext;

    input: AudioNode;
    output: AudioNode;
    preset: any;

    getPluginNode(): PluginNode;
    updatePreset(newPreset: any): any;
    updateNodes(): void;
}

export type PluginNode = {
    input: AudioNode;
    output: AudioNode;
};

export abstract class PluginBase implements Plugin {
    name: string;
    id: number;
    index: number;
    context: AudioContext;

    declare input: AudioNode;
    declare output: AudioNode;
    declare preset: any;
    abstract updateNodes(): void;

    constructor(currEnum: PluginsEnum, index: number, audioContext: AudioContext) {
        this.name = Plugins.find((x) => x.id === currEnum)!.name;
        this.id = currEnum;
        this.index = index;
        this.context = audioContext;
    }

    getPluginNode() {
        return { input: this.input, output: this.output };
    }

    updatePreset(newPreset) {
        this.preset = { ...this.preset, ...newPreset };
        this.updateNodes();
    }

    /**
     * Releases every Web Audio node the plugin owns.
     *
     * Teardown used to disconnect `input` and `output` only, which left each
     * plugin's internal graph wired together — and, for `Chorus`, left its LFO
     * oscillator running for the life of the page, still driving two delayTime
     * params (#276).
     *
     * The six plugins keep their nodes on instance properties (and `Delay`
     * keeps its delay lines in an array), with no common shape between them, so
     * this walks its own properties rather than making each subclass repeat a
     * dispose it would drift out of sync with. Disconnecting twice is a no-op,
     * so it is safe to call more than once.
     */
    dispose(): void {
        const release = (value: any): void => {
            if (!value || value === this.context) {
                return;
            }
            if (Array.isArray(value)) {
                value.forEach(release);
                return;
            }
            if (typeof value.disconnect !== 'function') {
                return;
            }
            if (typeof value.stop === 'function') {
                try {
                    // A source that was never started throws instead of stopping.
                    value.stop();
                } catch {
                    // already stopped, or never started
                }
            }
            value.disconnect();
        };
        Object.values(this).forEach(release);
    }
}

export default PluginBase;
