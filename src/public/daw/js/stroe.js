import { applyMiddleware, compose, createStore } from 'redux';
import { thunk } from 'redux-thunk';

import reducer from './reducers';

// Redux DevTools, when the browser extension is installed. Replaces the
// deprecated redux-devtools-extension package's composeWithDevTools.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));
export default store;
