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

export function updateWidth(width){
    return {
        type: 'UPDATE_WIDTH',
        payload: width
    }
}

export function changeFirstKeyboardKey(key){
    return {
        type: 'CHANGE_FIRST_KEYBOARD_KEY',
        payload: key
    }
}

export function addPlayingNote(note){
    return {
        type: 'ADD_PLAYING_NOTE',
        payload: note
    }
}

export function removePlayingNote(note){
    return {
        type: 'REMOVE_PLAYING_NOTE',
        payload: note
    }
}