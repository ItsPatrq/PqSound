export function changeOctaveNumber(number) {
    return{
        type: 'CHANGE_OCTAVE_NUMBER',
        payload: number
    }
}

export function switchKeyboardVisibility(show){
    return{
        type: 'SWITCH_KEYBOARD_VISIBILITY',
        payload: show
    }
}
