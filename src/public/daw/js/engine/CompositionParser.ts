/**
 * Pure region/note parsing. Every function takes the data it needs; nothing
 * here reaches for the store, so the same helpers serve the scheduler (which
 * passes its per-tick snapshot) and the UI (which passes props) — see #156.
 */
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

export const getRegionsByTrackIndex = (trackIndex: number, allRegions: Region[]): Region[] => {
    const regionsByTrackIndex = allRegions.filter((x) => x.trackIndex === trackIndex);

    return regionsByTrackIndex;
};

export const regionToDrawParser = (
    trackIndex: number,
    bits: number,
    copiedRegion: number,
    regionList: Region[],
): number[] => {
    const trackRegionList = getRegionsByTrackIndex(trackIndex, regionList);
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
};

export const getRegionIdByBitIndex = (trackIndex: number, bitIndex: number, regionList: Region[]): number | null => {
    const trackRegionList = getRegionsByTrackIndex(trackIndex, regionList);
    let regionId: number | null = null;
    for (let i = 0; i < trackRegionList.length; i++) {
        if (trackRegionList[i].start <= bitIndex && trackRegionList[i].end >= bitIndex) {
            regionId = trackRegionList[i].id;
        }
    }
    return regionId;
};

export const getRegionByRegionId = (regionId: number, regionList: Region[]): Region | null => {
    for (let i = 0; i < regionList.length; i++) {
        if (regionList[i].id === regionId) {
            return regionList[i];
        }
    }
    return null;
};

export const notesToDrawParser = (
    pianoRollNote: number,
    pianoRollRegion: number,
    regionList: Region[],
): number[] | null => {
    const region = getRegionByRegionId(pianoRollRegion, regionList);
    if (region === null) {
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
};

export const notesToPlay = (
    sixteenthPlaying: number,
    trackIndex: number,
    regionList: Region[],
): NoteToPlay[] | null => {
    const regions = getRegionsByTrackIndex(trackIndex, regionList);
    const regionsToPlay = regions.filter(
        (x) => x.start * 16 <= sixteenthPlaying && (x.start + x.regionLength) * 16 > sixteenthPlaying,
    );
    const notesToPlay: NoteToPlay[] = [];
    regionsToPlay.forEach((currRegion) => {
        for (let j = 0; j < currRegion.notes.length; j++) {
            if (Utils.isNullUndefinedOrEmpty(currRegion.notes[j])) {
                continue;
            }
            currRegion.notes[j].forEach((currNote) => {
                if (currNote.sixteenthNumber + currRegion.start * 16 === sixteenthPlaying) {
                    notesToPlay.push({ note: j, duration: currNote.length });
                }
            });
        }
    });
    return notesToPlay;
};
