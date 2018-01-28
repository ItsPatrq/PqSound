import React from 'react';
import ReactDOM from 'react-dom';
import App from 'containers/Main';
import { Provider } from 'react-redux';
import store from './stroe';

const app = document.getElementById('app');

// Render the main component into the dom
ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    app
);
