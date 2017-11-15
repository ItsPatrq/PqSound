export default function reducer(state={
    tracks: {
        name: 'cokolwiek'
    },
}, action) {
    switch (action.type){
        case "ADD_TRACK":{
            return{...state}
        }
    }

    return state;
}