import { PluginsEnum } from 'constants/Constants';

class Equalizer {
    constructor(index){
        this.name = PluginsEnum.Equalizer.name;
        this.id = PluginsEnum.Equalizer.id;
        this.index = index;
    }
}

export default Equalizer;