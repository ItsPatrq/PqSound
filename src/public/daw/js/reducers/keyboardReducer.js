import * as Utils from 'engine/Utils';
import { defaultKeyBindings } from 'constants/Constants';

export default function reducer(
    state = {
        width: 0,
        firstKey: 0,
        show: false,
        notesPlaying: [],
        keyNamesVisible: true,
        keyBindings: defaultKeyBindings,
        keyBindVisible: true,
    },
    action,
) {
    switch (action.type) {
        case 'CHANGE_OCTAVE_NUMBER': {
            return {
                ...state,
                octaves: action.payload,
            };
        }
        case 'SWITCH_KEYBOARD_VISIBILITY': {
            let showKeyboard;
            if (Utils.isNullUndefinedOrEmpty(action.payload)) {
                showKeyboard = !state.show;
            } else {
                showKeyboard = action.payload;
            }
            return {
                ...state,
                show: showKeyboard,
            };
        }
        case 'UPDATE_WIDTH': {
            return {
                ...state,
                width: action.payload,
            };
        }
        case 'CHANGE_FIRST_KEYBOARD_KEY': {
            return {
                ...state,
                firstKey: action.payload,
            };
        }
        case 'ADD_PLAYING_NOTE': {
            const newNotesPlaying = [...state.notesPlaying];
            newNotesPlaying.push(action.payload);
            return {
                ...state,
                notesPlaying: newNotesPlaying,
            };
        }
        case 'REMOVE_PLAYING_NOTE': {
            let newNotesPlaying = [...state.notesPlaying];
            newNotesPlaying = Utils.removeFirstFromArray(newNotesPlaying, (element /*, index*/) => {
                if (element === action.payload) {
                    return true;
                }
            });
            return {
                ...state,
                notesPlaying: newNotesPlaying,
            };
        }
        case 'CHANGE_KEY_BINDINGS': {
            const newKeyBindings = [...state.keyBindings];
            for (let i = 0; i < newKeyBindings.length; i++) {
                newKeyBindings[i].MIDINote = newKeyBindings[i].MIDINote + action.payload;
            }
            return {
                ...state,
                keyBindings: newKeyBindings,
            };
        }
        case 'SWITCH_KEY_NAME_VISIBILITY': {
            return {
                ...state,
                keyNamesVisible: !state.keyNamesVisible,
            };
        }
        case 'SWITCH_KEY_BIND_VISIBILITY': {
            return {
                ...state,
                keyBindVisible: !state.keyBindVisible,
            };
        }
    }

    return state;
}
