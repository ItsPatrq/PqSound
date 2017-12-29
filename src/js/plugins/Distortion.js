import { PluginsEnum } from 'constants/Constants';

class Distortion {
    constructor(index){
        this.name = PluginsEnum.Distortion.name;
        this.id = PluginsEnum.Distortion.id;
        this.index = index;
    }
}

export default Distortion;