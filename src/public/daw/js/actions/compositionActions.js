/**
 * The composition slice owns these now — RTK generates the creators and their
 * action types. Re-exported here so the existing import paths keep working;
 * the track-reorder pair keeps its shorter call-site names.
 */
export {
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
    regionTrackIndexUp as trackIndexUp,
    regionTrackIndexDown as trackIndexDown,
} from 'reducers/compositionReducer';
