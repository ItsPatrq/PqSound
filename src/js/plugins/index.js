
import Compressor from './Compressor';
import Equalizer from './Equalizer';
import Distortion from './Distortion';
import { PluginsEnum } from 'constants/Constants'
let Utils = {};

Utils.getNewPluginByIndex = (id, index) => {
    switch (id) {
        case PluginsEnum.Compressor.id: {
            return new Compressor(index);
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
    Compressor,
    Equalizer,
    Distortion,
    Utils
}