/**
 * The keyboard slice owns these now — RTK generates the creators and their
 * action types. Re-exported here so the existing import paths keep working.
 */
export {
    changeOctaveNumber,
    switchKeyboardVisibility,
    updateWidth,
    changeFirstKeyboardKey,
    addPlayingNote,
    removePlayingNote,
    changeKeyBindings,
    switchKeyNameVisibility,
    switchKeyBindVisibility,
} from 'reducers/keyboardReducer';
