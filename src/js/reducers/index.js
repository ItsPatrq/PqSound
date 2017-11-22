import { combineReducers } from 'redux';

import tracks from './tracksReducer';
import keyboard from './keyboardReducer';
import webAudio from './webAudioReducer';
import composition from './compositionReducer';
import control from './controlReducer';

export default combineReducers({
    tracks,
    keyboard,
    webAudio,
    composition,
    control
})