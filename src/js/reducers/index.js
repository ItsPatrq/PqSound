import { combineReducers } from 'redux';

import tracks from './tracksReducer';
import keyboard from './keyboardReducer';

export default combineReducers({
    tracks,
    keyboard
})