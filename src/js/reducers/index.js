import { combineReducers } from 'redux';

import tracks from './tracksReducer';
import keyboard from './keyboardReducer';
import webAudio from './webAudioReducer';

export default combineReducers({
    tracks,
    keyboard,
    webAudio
})