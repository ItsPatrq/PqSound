import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import reducer from './reducers';

const middleware = applyMiddleware(thunk, createLogger());

export default createStore(reducer, composeWithDevTools (middleware));