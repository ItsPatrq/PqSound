import { PluginsEnum } from 'constants/Constants';
import Store from '../stroe';

class Distortion {
    constructor(index){
        this.name = PluginsEnum.Distortion.name;
        this.id = PluginsEnum.Distortion.id;
        this.index = index;
        this.context = Store.getState().webAudio.context;
    }
    updatePreset(newPreset){
        this.preset = {...preset, ...newPreset};
    }
}

export default Distortion;