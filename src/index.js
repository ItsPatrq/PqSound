import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/Main';

window.AudioContext = window.AudioContext || window.webkitAudioContext;

// Render the main component into the dom
ReactDOM.render(<App />, document.getElementById('app'));
