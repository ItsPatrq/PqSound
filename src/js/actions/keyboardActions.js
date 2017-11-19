export function changeOctaveNumber(number) {
    return{
        type: 'CHANGE_OCTAVE_NUMBER',
        payload: number
    }
}

export function switchKeyboardVisibility(){
    return{
        type: 'SWITCH_KEYBOARD_VISIBILITY'
    }
}
