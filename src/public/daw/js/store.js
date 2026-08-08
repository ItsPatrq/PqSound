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
            // Off for now: the reducers are copy-on-write at the list level but
            // still mutate the track objects inside (e.g. `newTrackList[i].record = …`
            // after a shallow `[...state.trackList]`), which this check flags.
            // Making them fully immutable — or moving them to RTK's createSlice,
            // where Immer handles it — is the follow-up.
            immutableCheck: false,
        }),
    // RTK wires the Redux DevTools extension itself; the manual composeEnhancers
    // dance the old store did is gone.
    devTools: process.env.NODE_ENV !== 'production',
});

// Engine classes read the store through this bridge instead of importing this
// module, which keeps the dependency one-way (see engine/EngineStore).
connectStore(store);

export default store;
