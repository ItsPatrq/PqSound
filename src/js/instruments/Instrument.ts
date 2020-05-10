import { defaultKeysNames } from '../constants/Constants';
import { MIDIToNote } from '../engine/Utils';
import { isNullOrUndefined, devLog } from '../engine/Utils';
import { Voice } from './Voice';

export interface Instrument {
    name:string,
    id:number,
    voices:any[],
    context:AudioContext,
    output:AudioNode,
    preset:any,
    updatePreset(newPreset:any):void,
    noteOff(note:number):void,
    updateNodes():void,
    getNoteName(note:number):string,
    stopAll():void
}

export abstract class InstrumentBase implements Instrument {
    name:string;
    id:number;
    voices:Voice[];
    
    declare context:AudioContext;
    declare output:AudioNode;
    declare preset:any;
    abstract noteOff(note:number, endTime?:number):void;
    abstract updateNodes():void;
    constructor(currEnum, audioContext:AudioContext){
        this.name = currEnum.name;
        this.id = currEnum.id;
        this.voices = new Array;
        if (!isNullOrUndefined(audioContext)) {
            this.context = audioContext;
            this.output = this.context.createGain();
        } else {
            devLog("Instrument INIT error - no audioContext")
        }
    }

    updatePreset(newPreset){
        this.preset = {...this.preset, ...newPreset};
        this.updateNodes();
    }

    getNoteName(note){
        return defaultKeysNames[MIDIToNote(note)] + Math.ceil((MIDIToNote(note) - 2)/12);
    }

    stopAll(){
        for(let i = this.voices.length; i >= 0; i-- ){
            if(!isNullOrUndefined(this.voices[i])){
                this.noteOff(i);
            }
        }
    }
    
}

export default Instrument;