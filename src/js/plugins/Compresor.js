import { PluginsEnum } from 'constants/Constants';
import Store from '../stroe';

class Compresor {
    constructor(index){
        this.name = PluginsEnum.Compresor.name;
        this.id = PluginsEnum.Compresor.id;
        this.index = index;
        this.context = Store.getState().webAudio.context;
    }
    updatePreset(newPreset){
        this.preset = {...preset, ...newPreset};
    }
}

export default Compresor;