import { applyMiddleware, compose, createStore } from 'redux';
import { thunk } from 'redux-thunk';

import reducer from './reducers';
import { connectStore } from './engine/EngineStore';

// Redux DevTools, when the browser extension is installed. Replaces the
// deprecated redux-devtools-extension package's composeWithDevTools.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

// Engine classes read the store through this bridge instead of importing this
// module, which keeps the dependency one-way (see engine/EngineStore).
connectStore(store);

export default store;
