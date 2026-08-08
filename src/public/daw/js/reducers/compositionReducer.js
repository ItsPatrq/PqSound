import * as Utils from 'engine/Utils';
import * as compositionParser from 'engine/CompositionParser';

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
            const newRegionList = JSON.parse(JSON.stringify(state.regionList));
            let newRegionLastId = state.regionLastId;
            newRegionList.push({
                id: ++newRegionLastId,
                trackIndex: action.payload.trackIndex,
                regionLength: action.payload.length,
                start: action.payload.start,
                end: action.payload.start + action.payload.length - 1,
                notes: new Array(88),
            });
            return {
                ...state,
                regionList: newRegionList,
                regionLastId: newRegionLastId,
            };
        }
        case 'PASTE_REGION': {
            const newRegionList = JSON.parse(JSON.stringify(state.regionList));
            let newRegionLastId = state.regionLastId;
            const copiedRegion = compositionParser.getRegionByRegionId(action.payload.copiedRegion, newRegionList);
            if (!Utils.isNullOrUndefined(copiedRegion)) {
                newRegionList.push({
                    id: ++newRegionLastId,
                    trackIndex: action.payload.trackIndex,
                    regionLength: copiedRegion.regionLength,
                    start: action.payload.start,
                    end: action.payload.start + copiedRegion.regionLength - 1,
                    notes: JSON.parse(JSON.stringify(copiedRegion.notes)),
                });
            }
            return {
                ...state,
                regionList: newRegionList,
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
            const newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            const currRegion = compositionParser.getRegionByRegionId(action.payload.regionId, newRegionsList);
            if (Utils.isNullOrUndefined(currRegion.notes[action.payload.noteNumber])) {
                currRegion.notes[action.payload.noteNumber] = [];
            }
            currRegion.notes[action.payload.noteNumber].push({
                sixteenthNumber: action.payload.sixteenthNumber,
                length: action.payload.noteLength,
            });
            return {
                ...state,
                regionList: newRegionsList,
            };
        }
        case 'REMOVE_NOTE': {
            const newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            const currRegion = compositionParser.getRegionByRegionId(action.payload.regionId, newRegionsList);
            for (let i = 0; i < currRegion.notes[action.payload.noteNumber].length; i++) {
                if (
                    currRegion.notes[action.payload.noteNumber][i].sixteenthNumber <= action.payload.sixteenthNumber &&
                    currRegion.notes[action.payload.noteNumber][i].sixteenthNumber +
                        currRegion.notes[action.payload.noteNumber][i].length >
                        action.payload.sixteenthNumber
                ) {
                    currRegion.notes[action.payload.noteNumber].splice(i, 1);
                    break;
                }
            }
            return {
                ...state,
                regionList: newRegionsList,
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
            const newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            for (let i = 0; i < newRegionsList.length; i++) {
                if (newRegionsList[i].trackIndex === action.payload) {
                    ++newRegionsList[i].trackIndex;
                } else if (newRegionsList[i].trackIndex === action.payload + 1) {
                    --newRegionsList[i].trackIndex;
                }
            }
            return {
                ...state,
                regionList: newRegionsList,
            };
        }
        case 'REGION_TRACK_INDEX_DOWN': {
            const newRegionsList = JSON.parse(JSON.stringify(state.regionList));
            for (let i = 0; i < newRegionsList.length; i++) {
                if (newRegionsList[i].trackIndex === action.payload) {
                    --newRegionsList[i].trackIndex;
                } else if (newRegionsList[i].trackIndex === action.payload - 1) {
                    ++newRegionsList[i].trackIndex;
                }
            }
            return {
                ...state,
                regionList: newRegionsList,
            };
        }
    }

    return state;
}
