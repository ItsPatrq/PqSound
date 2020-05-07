
import Compressor from './Compressor';
import Equalizer from './Equalizer';
import Distortion from './Distortion';
import Delay from './Delay';
import Reverb from './Reverb';
import Chorus from './Chorus';
import { PluginsEnum } from 'constants/Constants'
let Utils = {};

Utils.getNewPluginByIndex = (id, index, audioContext) => {
    switch (id) {
        case PluginsEnum.Compressor.id: {
            return new Compressor(index, audioContext);
        }
        case PluginsEnum.Equalizer.id: {
            return new Equalizer(index, audioContext);
        }
        case PluginsEnum.Distortion.id: {
            return new Distortion(index, audioContext);
        }
        case PluginsEnum.Delay.id:{
            return new Delay(index, audioContext);
        }
        case PluginsEnum.Reverb.id:{
            return new Reverb(index, audioContext);
        }
        case PluginsEnum.Chorus.id:{
            return new Chorus(index, audioContext);
        }
    }
}

module.exports = {
    Compressor,
    Equalizer,
    Distortion,
    Delay,
    Reverb,
    Chorus,
    Utils
}