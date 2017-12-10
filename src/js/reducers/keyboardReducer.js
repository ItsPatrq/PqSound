import * as Utils from 'engine/Utils';

export default function reducer(state = {
    octaves: 7,
    firstOctave: 0,
    width: 0,
    firstKey: 0,
    show: false
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
    }

    return state;
}