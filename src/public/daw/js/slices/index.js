import { combineReducers } from 'redux';

import tracks from './tracksSlice';
import keyboard from './keyboardSlice';
import webAudio from './webAudioSlice';
import composition from './compositionSlice';
import control from './controlSlice';
import trackDetails from './trackDetailsSlice';

export default combineReducers({
    tracks,
    keyboard,
    webAudio,
    composition,
    control,
    trackDetails,
});
