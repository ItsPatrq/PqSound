//import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/Main';
import { Provider } from 'react-redux';
import store from './stroe';
window.AudioContext = window.AudioContext || window.webkitAudioContext;

const app = document.getElementById('app');

// Render the main component into the dom
ReactDOM.render(<Provider store={store}>
    <App />
    </Provider>,
    app
);
