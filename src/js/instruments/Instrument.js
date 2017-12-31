import Store from '../stroe';
import { Instruments, defaultKeysNames } from 'constants/Constants';
import { isNullOrUndefined, noteToFrequency, MIDIToNote } from 'engine/Utils';

class Instrument {
    constructor(currEnum){
        this.name = currEnum.name;
        this.id = currEnum.id;
    }


    getPluginNode(){
        return {input: this.input, output: this.output}
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
    
}

export default Instrument;