import Store from '../stroe';
import * as Utils from 'engine/Utils';
import { getRegionsByTrackIndex } from './Utils';

module.exports.regionToDrawParser = (trackIndex, bits) => {
    let regionList = Utils.getRegionsByTrackIndex(Store.getState().composition.regionsPerTrack, trackIndex);
    let bitsToDraw = new Array;
    for (let i = 0; i < bits; i++) {
        bitsToDraw.push(0);
    }
    for (let i = 0; i < regionList.length; i++) {
        bitsToDraw[regionList[i].start] = 1; //For applying different CSS for first and last bit in region
        for (let j = regionList[i].start + 1; j < regionList[i].end; j++) {
            bitsToDraw[j] = 2;
        }
        bitsToDraw[regionList[i].end] = 3; //For applying different CSS for first and last bit in region
    }
    return bitsToDraw;
}

module.exports.getRegionIdByBitIndex = (trackIndex, bitIndex) => {
    let regionList = Utils.getRegionsByTrackIndex(Store.getState().composition.regionsPerTrack, trackIndex);
    let regionId;
    for (let i = 0; i < regionList.length; i++) {
        if (regionList[i].start <= bitIndex && regionList[i].end >= bitIndex) {
            regionId = regionList[i].id;
        }
    }
    return regionId;
}

module.exports.getRegionByRegionId = (regionId, regionList) => {
    if (Utils.isNullOrUndefined(regionList)) {
        regionList = Store.getState().composition.regionList;
    }
    for (let i = 0; i < regionList.length; i++) {
        if (regionList[i].id === regionId) {
            return regionList[i];
        }
    }
}

module.exports.notesToDrawParser = (pianoRollNote) => {
    let region = module.exports.getRegionByRegionId(Store.getState().composition.pianoRollRegion);
    let notesToDraw = new Array;
    for (let i = 0; i < region.regionLength * 16; i++) {
        notesToDraw.push(0);
    }
    if (!Utils.isNullOrUndefined(region.notes[pianoRollNote])) {
        for (let i = 0; i < region.notes[pianoRollNote].length; i++) {
            let currNote = region.notes[pianoRollNote][i];
            notesToDraw[currNote.sixteenthNumber] = 1;
            for (let j = currNote.sixteenthNumber + 1; j < currNote.sixteenthNumber + currNote.length - 1; j++) {
                notesToDraw[j] = 2;
            }
            notesToDraw[currNote.sixteenthNumber + currNote.length - 1] = 3;
        }
    }
    return notesToDraw;
}