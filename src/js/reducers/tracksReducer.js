import * as Utils from '../engine/Utils';

export default function reducer(state = {
    trackList: [{
        'name': 'Piano',
        'instrument': {
            'name': 'Sampler',
            'preset': 'piano'
        },
        'volume': 100,
        'pan': 0,
        'record': true,
        'mute': false,
        'solo': false,
        'index': 1
    }],
    active: 1
}, action) {
    switch (action.type) {
        case 'ADD_TRACK': {
            const newTrackList = [...state.trackList];
            if (Utils.isNullUndefinedOrEmpty(action.payload)) {
                newTrackList.push(
                    {
                        'name': 'Piano',
                        'instrument': {
                            'name': 'Sampler',
                            'preset': 'piano'
                        },
                        'volume': 100,
                        'pan': 0,
                        'record': false,
                        'mute': false,
                        'solo': false,
                        'index': state.trackList.length + 1
                    }
                );
            } else {
                newTrackList.push(action.payload);
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'REMOVE_TRACK': {
            let newTrackList = [...state.trackList];
            let active = state.active;
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    if (newTrackList[i].record) {
                        if (i === 0) {
                            newTrackList[1].record = true;
                            active = 1;
                        } else {
                            newTrackList[i - 1].record = true;
                            active = i - 1;
                        }
                    }
                    newTrackList.splice(i, 1);
                    for (let j = i; j < newTrackList.length; j++) {
                        newTrackList[j].index = j + 1;
                    }
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                active: active
            }
        }
        case 'CHANGE_RECORD_STATE': {
            const newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].record = !newTrackList[i].record;
                } else if (newTrackList[i].index === state.active) {
                    newTrackList[i].record = false;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                active: action.payload
            }
        }
    }

    return state;
}