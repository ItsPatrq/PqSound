export default function reducer(state={
    octaves: 1,
    firstOctave: 1,
    show: true
}, action) {
    switch (action.type){
        case 'CHANGE_OCTAVE_NUMBER':{
            return{...state,
                octaves: action.payload
            }
        }
    }

    return state;
}