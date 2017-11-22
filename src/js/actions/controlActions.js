export function switchPlayState() {
    return {
        type: 'SWITCH_PLAY_STATE'
    }
}

export function changeBPM(BPM) {
    return {
        type: 'CHANGE_BPM',
        payload: BPM
    }
}