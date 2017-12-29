import { PluginsEnum } from 'constants/Constants';

class Compresor {
    constructor(index){
        this.name = PluginsEnum.Compresor.name;
        this.id = PluginsEnum.Compresor.id;
        this.index = index;
    }
}

export default Compresor;