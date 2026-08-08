import { configureStore } from '@reduxjs/toolkit';

import reducer from './reducers';
import { connectStore } from './engine/EngineStore';

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // The whole point of #156: every slice is serializable now, so keep
            // this on — it is what stops live audio objects creeping back into
            // state. The live AudioContext/Track/instrument/plugin objects live
            // in engine/AudioEngine.
            serializableCheck: true,
            // On since the reducers were made fully copy-on-write: nothing
            // writes to an object from the previous state any more.
            immutableCheck: true,
        }),
    // RTK wires the Redux DevTools extension itself; the manual composeEnhancers
    // dance the old store did is gone.
    devTools: process.env.NODE_ENV !== 'production',
});

// Engine classes read the store through this bridge instead of importing this
// module, which keeps the dependency one-way (see engine/EngineStore).
connectStore(store);

export default store;
