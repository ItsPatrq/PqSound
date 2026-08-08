import { emptySnapshot, selectEngineSnapshot } from './EngineSnapshot';
import type { EngineSnapshot } from './EngineSnapshot';

/**
 * The engine's one-way link to the Redux store.
 *
 * Engine classes used to `import Store from '../store'` directly, which made
 * the dependency run engine -> store -> reducers -> engine and closed an import
 * cycle. They now read a **snapshot** the store pushes on every change, and
 * dispatch through here — so the engine sees a small explicit shape rather than
 * the store's layout, and never calls `getState()` at all (#156).
 *
 * Nothing under `engine/` imports the store module.
 */
type Dispatch = (action: any) => any;

let dispatchFn: Dispatch | null = null;
let snapshot: EngineSnapshot = emptySnapshot;

/**
 * Wires the bridge to a store and keeps the snapshot current. Returns the
 * unsubscribe handle, mostly so tests can detach.
 */
export function connectStore(store: {
    getState: () => any;
    dispatch: Dispatch;
    subscribe: (listener: () => void) => any;
}) {
    dispatchFn = (action) => store.dispatch(action);
    snapshot = selectEngineSnapshot(store.getState());
    return store.subscribe(() => {
        snapshot = selectEngineSnapshot(store.getState());
    });
}

/** Disconnects the bridge and drops the snapshot. Test seam. */
export function disconnectStore(): void {
    dispatchFn = null;
    snapshot = emptySnapshot;
}

/**
 * The engine's view of state, as of the last dispatch. Reads are cheap: the
 * projection runs once per store change, not once per call.
 */
export function getSnapshot(): EngineSnapshot {
    return snapshot;
}

/** Test seam: sets the snapshot without a store. */
export function setSnapshot(next: EngineSnapshot): void {
    snapshot = next;
}

export function dispatch(action: any): any {
    if (!dispatchFn) {
        throw new Error('EngineStore is not connected to a store yet');
    }
    return dispatchFn(action);
}
