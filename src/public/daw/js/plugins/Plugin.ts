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
        this.name = Plugins.find(x => x.id === currEnum)!.name;
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
}

export default PluginBase;
