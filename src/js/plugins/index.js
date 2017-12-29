
import Compresor from './Compresor';
import Equalizer from './Equalizer';
import Distortion from './Distortion';
import { PluginsEnum } from 'constants/Constants'
let Utils = {};

Utils.getNewPluginByIndex = (id, index) => {
    switch (id) {
        case PluginsEnum.Compresor.id: {
            return new Compresor(index);
        }
        case PluginsEnum.Equalizer.id: {
            return new Equalizer(index);
        }
        case PluginsEnum.Distortion.id: {
            return new Distortion(index);
        }
    }
}

module.exports = {
    Compresor,
    Equalizer,
    Distortion,
    Utils
}