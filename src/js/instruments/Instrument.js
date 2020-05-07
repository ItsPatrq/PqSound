import { defaultKeysNames } from 'constants/Constants';
import { MIDIToNote } from 'engine/Utils';
import { isNullOrUndefined, devLog } from 'engine/Utils';

class Instrument {
    constructor(currEnum, audioContext){
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

    updateNodes(){
        
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