import * as Utils from 'engine/Utils';
import * as compositionParser from 'engine/CompositionParser';

/** Copies a region's note rows and the notes inside them. */
const copyNotes = (notes) => notes.map((row) => (row ? row.map((note) => ({ ...note })) : row));

/**
 * Replaces one note row of one region, leaving every other region — and every
 * other row of that region — untouched. Drawing a note used to deep-copy the
 * whole composition (`JSON.parse(JSON.stringify(regionList))`) for this.
 */
const updateNoteRow = (regionList, regionId, noteNumber, update) =>
    regionList.map((region) => {
        if (region.id !== regionId) {
            return region;
        }
        const notes = [...region.notes];
        notes[noteNumber] = update(notes[noteNumber] || []);
        return { ...region, notes };
    });

export default function reducer(
    state = {
        barsInComposition: 48,
        maxBarsInComposition: 1000,
        showPianoRoll: false,
        showMixer: false,
        pianoRollRegion: null,
        regionList: [],
        regionLastId: 0,
        // Loop range in BARS. Default = whole composition, disabled.
        loopEnabled: false,
        loopStart: 0,
        loopEnd: 48,
    },
    action,
) {
    switch (action.type) {
        case 'REMOVE_TRACK_FROM_COMPOSITION': {
            // Copy-on-write: the surviving regions are the same objects as in
            // the previous state, so shifting the index has to replace them.
            const newRegionList = state.regionList
                .filter((el) => el.trackIndex !== action.payload)
                .map((el) => (el.trackIndex > action.payload ? { ...el, trackIndex: el.trackIndex - 1 } : el));
            const newPianoRollRegion = state.pianoRollRegion === action.payload ? null : state.pianoRollRegion;
            return {
                ...state,
                regionList: newRegionList,
                pianoRollRegion: newPianoRollRegion,
            };
        }
        case 'ADD_REGION': {
            const newRegionLastId = state.regionLastId + 1;
            return {
                ...state,
                regionList: [
                    ...state.regionList,
                    {
                        id: newRegionLastId,
                        trackIndex: action.payload.trackIndex,
                        regionLength: action.payload.length,
                        start: action.payload.start,
                        end: action.payload.start + action.payload.length - 1,
                        notes: new Array(88),
                    },
                ],
                regionLastId: newRegionLastId,
            };
        }
        case 'PASTE_REGION': {
            const copiedRegion = compositionParser.getRegionByRegionId(action.payload.copiedRegion, state.regionList);
            if (Utils.isNullOrUndefined(copiedRegion)) {
                return state;
            }
            const newRegionLastId = state.regionLastId + 1;
            return {
                ...state,
                regionList: [
                    ...state.regionList,
                    {
                        id: newRegionLastId,
                        trackIndex: action.payload.trackIndex,
                        regionLength: copiedRegion.regionLength,
                        start: action.payload.start,
                        end: action.payload.start + copiedRegion.regionLength - 1,
                        // The pasted region owns its notes: copy the rows and the
                        // notes in them, not just the outer array.
                        notes: copyNotes(copiedRegion.notes),
                    },
                ],
                regionLastId: newRegionLastId,
            };
        }
        case 'REMOVE_REGION': {
            return {
                ...state,
                regionList: state.regionList.filter((el) => {
                    return el.id !== action.payload;
                }),
            };
        }
        case 'ADD_NOTE': {
            return {
                ...state,
                regionList: updateNoteRow(
                    state.regionList,
                    action.payload.regionId,
                    action.payload.noteNumber,
                    (row) => [
                        ...row,
                        {
                            sixteenthNumber: action.payload.sixteenthNumber,
                            length: action.payload.noteLength,
                        },
                    ],
                ),
            };
        }
        case 'REMOVE_NOTE': {
            return {
                ...state,
                regionList: updateNoteRow(
                    state.regionList,
                    action.payload.regionId,
                    action.payload.noteNumber,
                    (row) => {
                        // Only the first note covering that sixteenth is removed.
                        const hit = row.findIndex(
                            (note) =>
                                note.sixteenthNumber <= action.payload.sixteenthNumber &&
                                note.sixteenthNumber + note.length > action.payload.sixteenthNumber,
                        );
                        return hit === -1 ? row : [...row.slice(0, hit), ...row.slice(hit + 1)];
                    },
                ),
            };
        }
        case 'CHANGE_BITS_NUMBER': {
            return {
                ...state,
                barsInComposition: action.payload,
            };
        }
        case 'SHOW_PIANO_ROLL': {
            return {
                ...state,
                showPianoRoll: true,
                pianoRollRegion: action.payload.regionIndex,
            };
        }
        case 'SWITCH_PIANO_ROLL_VISIBILITY': {
            let show;
            if (Utils.isNullUndefinedOrEmpty(action.payload)) {
                if (Utils.isNullUndefinedOrEmpty(state.pianoRollRegion)) {
                    show = false;
                } else {
                    show = !state.showPianoRoll;
                }
            } else {
                show = action.payload;
            }
            return {
                ...state,
                showPianoRoll: show,
            };
        }
        case 'SWITCH_MIXER_VISIBILITY': {
            return {
                ...state,
                showMixer: action.payload === undefined ? !state.showMixer : action.payload,
            };
        }
        case 'CHANGE_BARS_IN_COMPOSITION': {
            const newBars = action.payload;
            // Keep the loop range valid as the composition length changes: a loop that
            // spanned the whole composition grows/shrinks with it, otherwise clamp both
            // ends into the new range so the loop can never point past the last bar.
            const loopEnd = state.loopEnd >= state.barsInComposition ? newBars : Math.min(state.loopEnd, newBars);
            const loopStart = Math.min(state.loopStart, Math.max(0, newBars - 1));
            return {
                ...state,
                barsInComposition: newBars,
                loopEnd,
                loopStart,
            };
        }
        case 'SWITCH_LOOP': {
            return {
                ...state,
                loopEnabled: action.payload === undefined ? !state.loopEnabled : action.payload,
            };
        }
        case 'CHANGE_LOOP_RANGE': {
            return {
                ...state,
                loopStart: action.payload.start,
                loopEnd: action.payload.end,
            };
        }
        case 'LOAD_COMPOSITION_STATE': {
            return {
                // keep loop defaults if an older saved composition lacks them
                loopEnabled: false,
                loopStart: 0,
                loopEnd: action.payload.barsInComposition || state.loopEnd,
                ...action.payload,
            };
        }
        case 'REGION_TRACK_INDEX_UP': {
            return {
                ...state,
                regionList: state.regionList.map((region) => {
                    if (region.trackIndex === action.payload) {
                        return { ...region, trackIndex: region.trackIndex + 1 };
                    }
                    if (region.trackIndex === action.payload + 1) {
                        return { ...region, trackIndex: region.trackIndex - 1 };
                    }
                    return region;
                }),
            };
        }
        case 'REGION_TRACK_INDEX_DOWN': {
            return {
                ...state,
                regionList: state.regionList.map((region) => {
                    if (region.trackIndex === action.payload) {
                        return { ...region, trackIndex: region.trackIndex - 1 };
                    }
                    if (region.trackIndex === action.payload - 1) {
                        return { ...region, trackIndex: region.trackIndex + 1 };
                    }
                    return region;
                }),
            };
        }
    }

    return state;
}
