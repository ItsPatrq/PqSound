import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from 'containers/Main';
import { Provider } from 'react-redux';
import store from './stroe';

const app = document.getElementById('app');

// Render the main component into the dom
const root = createRoot(app);
root.render(
    <Provider store={store}>
        <App />
    </Provider>,
);
