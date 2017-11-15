export function addTrack(name) {
    return{ 
        type: 'ADD_TRACK',
        payload: name,
    }
};