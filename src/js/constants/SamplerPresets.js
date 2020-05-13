import * as AudioFiles from 'constants/AudioFiles';

const Presets = {
    DSKGrandPiano: {
        name: 'DSK Grand Piano',
        id: 0,
        content: AudioFiles.DSKGrandPiano,
    },
    SlingerlandKit: {
        name: 'Slingerland Kit',
        id: 1,
        content: AudioFiles.SlingerlandKit,
    },
    RockKit: {
        name: 'Rock Kit',
        id: 2,
        content: AudioFiles.RockKit,
    },
};

//TODO zmiana nazw
const presetList = [
    {
        name: 'Acoustic Pianos',
        presets: [Presets.DSKGrandPiano],
    },
    {
        name: 'Drums & Percussion',
        presets: [Presets.SlingerlandKit, Presets.RockKit],
    },
];

const Utils = {};

Utils.getPresetByName = function (name) {
    for (let i = 0; i < presetList.length; i++) {
        for (let j = 0; j < presetList[i].presets.length; j++) {
            if (presetList[i].presets[j].name === name) {
                return presetList[i].presets[j];
            }
        }
    }
};

Utils.getPresetById = function (id) {
    for (let i = 0; i < presetList.length; i++) {
        for (let j = 0; j < presetList[i].presets.length; j++) {
            if (presetList[i].presets[j].id === id) {
                return presetList[i].presets[j];
            }
        }
    }
};

Utils.getPresetListByName = function (name) {
    for (let i = 0; i < presetList.length; i++) {
        if (presetList[i].name === name) {
            return presetList[i];
        }
    }
};

export { Utils };
export { Presets };
export { presetList };
export default presetList;
