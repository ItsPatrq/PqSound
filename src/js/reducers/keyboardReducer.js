export default function reducer(state = {
    octaves: 1,
    firstOctave: 2,
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
            return {
                ...state,
                show: !state.show
            }
        }
    }

    return state;
}