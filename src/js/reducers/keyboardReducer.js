import * as Utils from 'engine/Utils';

export default function reducer(state = {
    width: 0,
    firstKey: 0,
    show: false,
    notesPlaying: new Array
}, action) {
    switch (action.type) {
        case 'CHANGE_OCTAVE_NUMBER': {
            return {
                ...state,
                octaves: action.payload
            }
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
                show: showKeyboard
            }
        }
        case 'UPDATE_WIDTH': {
            return {
                ...state,
                width: action.payload
            }
        }
        case 'CHANGE_FIRST_KEYBOARD_KEY': {
            return {
                ...state,
                firstKey: action.payload
            }
        }
        case 'ADD_PLAYING_NOTE':{
            let newNotesPlaying = [...state.notesPlaying];
            newNotesPlaying.push(action.payload);
            return {
                ...state,
                notesPlaying: newNotesPlaying
            }
        }
        case 'REMOVE_PLAYING_NOTE':{
            let newNotesPlaying = [...state.notesPlaying];
            newNotesPlaying = Utils.removeFirstFromArray(newNotesPlaying, (element/*, index*/) => {
                if(element === action.payload) {
                    return true;
                }
            });
            return {
                ...state,
                notesPlaying: newNotesPlaying
            }
        }
    }

    return state;
}