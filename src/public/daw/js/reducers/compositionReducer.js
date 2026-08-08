import { createSlice } from '@reduxjs/toolkit';

import * as Utils from 'engine/Utils';
import * as compositionParser from 'engine/CompositionParser';

/**
 * Copies a region's note rows and the notes inside them. Spreading each note
 * also unwraps Immer drafts into plain objects, so the pasted region owns its
 * data rather than aliasing the source's.
 */
const copyNotes = (notes) => notes.map((row) => (row ? row.map((note) => ({ ...note })) : row));

/**
 * Regions and their notes. The bodies mutate drafts, and Immer keeps the
 * structural sharing the hand-rolled targeted copies from #233 were written to
 * preserve — untouched regions and note rows stay identical, which the tests
 * assert.
 */
const compositionSlice = createSlice({
    name: 'composition',
    initialState: {
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
    reducers: {
        removeTrackFromComposition(state, action) {
            state.regionList = state.regionList.filter((region) => region.trackIndex !== action.payload);
            state.regionList.forEach((region) => {
                if (region.trackIndex > action.payload) {
                    region.trackIndex = region.trackIndex - 1;
                }
            });
            if (state.pianoRollRegion === action.payload) {
                state.pianoRollRegion = null;
            }
        },
        addRegion: {
            reducer(state, action) {
                state.regionLastId = state.regionLastId + 1;
                state.regionList.push({
                    id: state.regionLastId,
                    trackIndex: action.payload.trackIndex,
                    regionLength: action.payload.length,
                    start: action.payload.start,
                    end: action.payload.start + action.payload.length - 1,
                    notes: new Array(88),
                });
            },
            prepare(newTrackIndex, newStart, length) {
                return { payload: { trackIndex: newTrackIndex, start: newStart, length: length } };
            },
        },
        pasteRegion: {
            reducer(state, action) {
                const copiedRegion = compositionParser.getRegionByRegionId(
                    action.payload.copiedRegion,
                    state.regionList,
                );
                if (Utils.isNullOrUndefined(copiedRegion)) {
                    return;
                }
                state.regionLastId = state.regionLastId + 1;
                state.regionList.push({
                    id: state.regionLastId,
                    trackIndex: action.payload.trackIndex,
                    regionLength: copiedRegion.regionLength,
                    start: action.payload.start,
                    end: action.payload.start + copiedRegion.regionLength - 1,
                    // The pasted region owns its notes: copy the rows and the
                    // notes in them, not just the outer array.
                    notes: copyNotes(copiedRegion.notes),
                });
            },
            prepare(newTrackIndex, newStart, newCopiedRegion) {
                return { payload: { trackIndex: newTrackIndex, start: newStart, copiedRegion: newCopiedRegion } };
            },
        },
        removeRegion(state, action) {
            state.regionList = state.regionList.filter((region) => region.id !== action.payload);
        },
        addNote: {
            reducer(state, action) {
                const region = state.regionList.find((curr) => curr.id === action.payload.regionId);
                if (!region) {
                    return;
                }
                if (Utils.isNullOrUndefined(region.notes[action.payload.noteNumber])) {
                    region.notes[action.payload.noteNumber] = [];
                }
                region.notes[action.payload.noteNumber].push({
                    sixteenthNumber: action.payload.sixteenthNumber,
                    length: action.payload.noteLength,
                });
            },
            prepare(newRegionId, newNoteNumber, newSixteenthNumber, newNoteLength) {
                return {
                    payload: {
                        regionId: newRegionId,
                        noteNumber: newNoteNumber,
                        sixteenthNumber: newSixteenthNumber,
                        noteLength: newNoteLength,
                    },
                };
            },
        },
        removeNote: {
            reducer(state, action) {
                const region = state.regionList.find((curr) => curr.id === action.payload.regionId);
                const row = region ? region.notes[action.payload.noteNumber] : undefined;
                if (!row) {
                    return;
                }
                // Only the first note covering that sixteenth is removed.
                const hit = row.findIndex(
                    (note) =>
                        note.sixteenthNumber <= action.payload.sixteenthNumber &&
                        note.sixteenthNumber + note.length > action.payload.sixteenthNumber,
                );
                if (hit !== -1) {
                    row.splice(hit, 1);
                }
            },
            prepare(newRegionId, newNoteNumber, newSixteenthNumber, newNoteLength) {
                return {
                    payload: {
                        regionId: newRegionId,
                        noteNumber: newNoteNumber,
                        sixteenthNumber: newSixteenthNumber,
                        noteLength: newNoteLength,
                    },
                };
            },
        },
        showPianoRoll: {
            reducer(state, action) {
                state.showPianoRoll = true;
                state.pianoRollRegion = action.payload.regionIndex;
            },
            prepare(newTrackIndex, newRegionIndex) {
                return { payload: { trackIndex: newTrackIndex, regionIndex: newRegionIndex } };
            },
        },
        switchPianorollVisibility(state, action) {
            if (Utils.isNullUndefinedOrEmpty(action.payload)) {
                // Nothing to show without a region selected.
                state.showPianoRoll = Utils.isNullUndefinedOrEmpty(state.pianoRollRegion)
                    ? false
                    : !state.showPianoRoll;
            } else {
                state.showPianoRoll = action.payload;
            }
        },
        switchMixerVisibility(state, action) {
            state.showMixer = action.payload === undefined ? !state.showMixer : action.payload;
        },
        changeBarsInComposition(state, action) {
            const newBars = action.payload;
            // Keep the loop range valid as the composition length changes: a loop that
            // spanned the whole composition grows/shrinks with it, otherwise clamp both
            // ends into the new range so the loop can never point past the last bar.
            state.loopEnd = state.loopEnd >= state.barsInComposition ? newBars : Math.min(state.loopEnd, newBars);
            state.loopStart = Math.min(state.loopStart, Math.max(0, newBars - 1));
            state.barsInComposition = newBars;
        },
        switchLoop(state, action) {
            state.loopEnabled = action.payload === undefined ? !state.loopEnabled : action.payload;
        },
        changeLoopRange: {
            reducer(state, action) {
                state.loopStart = action.payload.start;
                state.loopEnd = action.payload.end;
            },
            prepare(start, end) {
                return { payload: { start: start, end: end } };
            },
        },
        loadCompositionState(state, action) {
            return {
                // keep loop defaults if an older saved composition lacks them
                loopEnabled: false,
                loopStart: 0,
                loopEnd: action.payload.barsInComposition || state.loopEnd,
                ...action.payload,
            };
        },
        regionTrackIndexUp(state, action) {
            state.regionList.forEach((region) => {
                if (region.trackIndex === action.payload) {
                    region.trackIndex = region.trackIndex + 1;
                } else if (region.trackIndex === action.payload + 1) {
                    region.trackIndex = region.trackIndex - 1;
                }
            });
        },
        regionTrackIndexDown(state, action) {
            state.regionList.forEach((region) => {
                if (region.trackIndex === action.payload) {
                    region.trackIndex = region.trackIndex - 1;
                } else if (region.trackIndex === action.payload - 1) {
                    region.trackIndex = region.trackIndex + 1;
                }
            });
        },
    },
});

export const {
    removeTrackFromComposition,
    addRegion,
    pasteRegion,
    removeRegion,
    addNote,
    removeNote,
    showPianoRoll,
    switchPianorollVisibility,
    switchMixerVisibility,
    changeBarsInComposition,
    switchLoop,
    changeLoopRange,
    loadCompositionState,
    regionTrackIndexUp,
    regionTrackIndexDown,
} = compositionSlice.actions;

export default compositionSlice.reducer;
