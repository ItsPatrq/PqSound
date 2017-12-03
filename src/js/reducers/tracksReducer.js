import * as Utils from 'engine/Utils';
import Sound from 'engine/Sound'

export default function reducer(state = {
    trackList: [
        {
            name: 'Master',
            volume: 1.0,
            pan: 0,
            mute: false,
            solo: false,
            index: 0
        },
        {
            name: 'Piano',
            instrument: {
                name: 'Sampler',
                preset: 'Classical Piano'
            },
            sound: null,
            volume: 1.0,
            pan: 0,
            record: true,
            mute: false,
            solo: false,
            index: 1
        }],
    selected: 1
}, action) {
    switch (action.type) {
        case 'ADD_TRACK': {
            let newTrackList = [...state.trackList];
            if (Utils.isNullUndefinedOrEmpty(action.payload)) {
                newTrackList.push(
                    {
                        name: 'Default',
                        instrument: {
                            name: 'Sampler',
                            preset: 'Classical Piano'
                        },
                        sound: null,
                        volume: 1.0,
                        pan: 0,
                        record: false,
                        mute: false,
                        solo: false,
                        index: state.trackList.length
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
            let selected = state.selected;
            for (let i = 1; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    if (newTrackList[i].index === selected) {
                        selected = null
                    }
                    newTrackList.splice(i, 1);
                    for (let j = i; j < newTrackList.length; j++) {
                        newTrackList[j].index = j;
                    }
                    break;
                }
            }
            return {
                ...state,
                trackList: newTrackList,
                selected: selected
            }
        }
        case 'CHANGE_RECORD_STATE': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload) {
                    newTrackList[i].record = !newTrackList[i].record;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_TRACK_NAME': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].name = action.payload.newTrackName;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'CHANGE_SELECTED_TRACK': {
            return {
                ...state,
                selected: action.payload
            }
        }
        case 'CHANGE_TRACK_PRESET': {
            let newTrackList = [...state.trackList];
            for (let i = 0; i < newTrackList.length; i++) {
                if (newTrackList[i].index === action.payload.index) {
                    newTrackList[i].instrument.preset = action.payload.preset;
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
        case 'INIT_TRACK_SOUND': {
            let newTrackList = [...state.trackList];
            if (Utils.isNullOrUndefined(action.payload)) {
                newTrackList[newTrackList.length - 1].sound = new Sound(newTrackList.length - 1);
            } else {
                for (let i = 0; i < newTrackList.length; i++) {
                    if (newTrackList[i].index === action.payload) {
                        newTrackList[i].sound = new Sound(action.payload);
                    }
                }
            }
            return {
                ...state,
                trackList: newTrackList
            }
        }
    }

    return state;
}