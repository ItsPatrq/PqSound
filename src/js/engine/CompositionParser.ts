import Store from '../stroe';
import * as Utils from './Utils';

interface Region {
    end: number;
    id: number;
    start: number;
    regionLength: number;
    notes: Notes[];
    trackIndex: number;
}

type Notes = Note[];

interface NoteToPlay {
    duration: number;
    note: number;
}

interface Note {
    sixteenthNumber: number;
    length: number;
}

export const getRegionsByTrackIndex = (trackIndex: number, allRegions?: Region[]): Region[] => {
    const regionsByTrackIndex: Region[] = [];
    if (!allRegions) {
        allRegions = (Store.getState().composition.regionList as Region[]);
    }
    for (let i = 0; i < allRegions.length; i++) {
        if (allRegions[i].trackIndex === trackIndex) {
            regionsByTrackIndex.push(allRegions[i]);
        }
    }
    return regionsByTrackIndex;
}

export const regionToDrawParser = (trackIndex: number, bits: number, copiedRegion: number): number[] => {
    const trackRegionList = getRegionsByTrackIndex(trackIndex);
    const bitsToDraw: number[] = [];
    for (let i = 0; i < bits; i++) {
        bitsToDraw.push(0);
    }
    for (let i = 0; i < trackRegionList.length; i++) {
        if (trackRegionList[i].id !== copiedRegion) {
            bitsToDraw[trackRegionList[i].start] = 1; //For applying different CSS for first and last bit in region
            for (let j = trackRegionList[i].start + 1; j < trackRegionList[i].end; j++) {
                bitsToDraw[j] = 2;
            }
            bitsToDraw[trackRegionList[i].end] = 3; //For applying different CSS for first and last bit in region
        } else {
            bitsToDraw[trackRegionList[i].start] = 4; //For applying different CSS for first and last bit in region
            for (let j = trackRegionList[i].start + 1; j < trackRegionList[i].end; j++) {
                bitsToDraw[j] = 5;
            }
            bitsToDraw[trackRegionList[i].end] = 6; //For applying different CSS for first and last bit in region
        }
    }
    return bitsToDraw;
}

export const getRegionIdByBitIndex = (trackIndex: number, bitIndex: number): number | null => {
    const trackRegionList = getRegionsByTrackIndex(trackIndex);
    let regionId: number | null = null;
    for (let i = 0; i < trackRegionList.length; i++) {
        if (trackRegionList[i].start <= bitIndex && trackRegionList[i].end >= bitIndex) {
            regionId = trackRegionList[i].id;
        }
    }
    return regionId;
}

export const getRegionByRegionId = (regionId: number, regionList?: Region[]): Region | null => {
    if (!regionList) {
        regionList = (Store.getState().composition.regionList as Region[]);
    }
    for (let i = 0; i < regionList.length; i++) {
        if (regionList[i].id === regionId) {
            return regionList[i];
        }
    }
    return null;
}

export const notesToDrawParser = (pianoRollNote: number): number[] | null => {
    const region = getRegionByRegionId(Store.getState().composition.pianoRollRegion);
    if(region === null) {
        return null;
    }
    const notesToDraw: number[] = [];
    for (let i = 0; i < region.regionLength * 16; i++) {
        notesToDraw.push(0);
    }
    if (!Utils.isNullOrUndefined(region.notes[pianoRollNote])) {
        for (let i = 0; i < region.notes[pianoRollNote].length; i++) {
            const currNote = region.notes[pianoRollNote][i];
            notesToDraw[currNote.sixteenthNumber] = 1;
            for (let j = currNote.sixteenthNumber + 1; j < currNote.sixteenthNumber + currNote.length - 1; j++) {
                notesToDraw[j] = 2;
            }
            notesToDraw[currNote.sixteenthNumber + currNote.length - 1] = 3;
        }
    }
    return notesToDraw;
}

export const notesToPlay = (sixteenthPlaying: number, trackIndex: number): NoteToPlay[] | null => {
    const regions = getRegionsByTrackIndex(trackIndex);
    if (Utils.isNullUndefinedOrEmpty(regions)) {
        return null;
    }
    const notesToPlay: NoteToPlay[] = [];
    for (let i = 0; i < regions.length; i++) {
        if (regions[i].start * 16 <= sixteenthPlaying && (regions[i].end + 1) * 16 >= sixteenthPlaying) {
            const currRegion = regions[i];
            for (let j = 0; j < currRegion.notes.length; j++) {
                if (!Utils.isNullUndefinedOrEmpty(currRegion.notes[j])) {
                    for (let z = 0; z < currRegion.notes[j].length; z++) {
                        if (currRegion.notes[j][z].sixteenthNumber + currRegion.start * 16 === sixteenthPlaying) {
                            notesToPlay.push({ note: j, duration: currRegion.notes[j][z].length });
                        }
                    }
                }
            }
        }
        return notesToPlay;
    }
    return null;
}