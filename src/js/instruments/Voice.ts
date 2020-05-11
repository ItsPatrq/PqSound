import { isNullOrUndefined } from "../engine/Utils";

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
    constructor(audioContext: AudioContext, preset: any){
        if (!isNullOrUndefined(audioContext)) {
            this.context = audioContext;
            this.preset = preset;
        }
    }
    abstract start(time: number);
    abstract stop(time: number);
    abstract connect(target: AudioNode);
    abstract updatePreset(preset: any);

    declare context: AudioContext;
    declare preset: any;
    declare output: AudioNode;
}