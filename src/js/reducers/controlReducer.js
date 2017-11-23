export default function reducer(state = {
    BPM: 120,
    minBPM: 50,
    maxBPM: 250,
    playing: false,
    show: false
}, action) {
    switch (action.type) {
        case 'SWITCH_PLAY_STATE': {
            return {
                ...state,
                playing: !state.playing
            }
        }
        case 'CHANGE_BPM':{
            return {
                ...state,
                BPM: action.payload
            }
        }
    }

    return state;
}