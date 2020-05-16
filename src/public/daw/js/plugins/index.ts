import Compressor from './Compressor';
import Equalizer from './Equalizer';
import Distortion from './Distortion';
import Delay from './Delay';
import Reverb from './Reverb';
import Chorus from './Chorus';
import { PluginsEnum } from '../constants/Constants';

interface PluginUtils {
    getNewPluginByIndex(id: number, index: number, audioContext: AudioContext): any;
}

const Utils: PluginUtils = {
    getNewPluginByIndex: (id, index, audioContext) => {
        switch (id) {
            case PluginsEnum.Compressor: {
                return new Compressor(index, audioContext);
            }
            case PluginsEnum.Equalizer: {
                return new Equalizer(index, audioContext);
            }
            case PluginsEnum.Distortion: {
                return new Distortion(index, audioContext);
            }
            case PluginsEnum.Delay: {
                return new Delay(index, audioContext);
            }
            case PluginsEnum.Reverb: {
                return new Reverb(index, audioContext);
            }
            case PluginsEnum.Chorus: {
                return new Chorus(index, audioContext);
            }
            default: {
                return;
            }
        }
    },
};

export { Compressor, Equalizer, Distortion, Delay, Reverb, Chorus, Utils };
