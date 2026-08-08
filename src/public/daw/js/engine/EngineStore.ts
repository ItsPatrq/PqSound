/**
 * The engine's one-way view of the Redux store.
 *
 * Engine classes used to `import Store from '../store'` directly, which made
 * the dependency run engine -> store -> reducers -> engine and closed an import
 * cycle. They now read through this bridge, which the store connects to itself
 * once at creation. Nothing under `engine/` imports the store module any more,
 * so the engine can be constructed and tested without one (see #156).
 *
 * The store shape stays `any` on purpose: typing it belongs with the RTK
 * migration, once the slices are fully serializable.
 */
type GetState = () => any;
type Dispatch = (action: any) => any;

let getStateFn: GetState | null = null;
let dispatchFn: Dispatch | null = null;

export function connectStore(store: { getState: GetState; dispatch: Dispatch }): void {
    getStateFn = () => store.getState();
    dispatchFn = (action) => store.dispatch(action);
}

/** Disconnects the bridge. Test seam. */
export function disconnectStore(): void {
    getStateFn = null;
    dispatchFn = null;
}

export function getState(): any {
    if (!getStateFn) {
        throw new Error('EngineStore is not connected to a store yet');
    }
    return getStateFn();
}

export function dispatch(action: any): any {
    if (!dispatchFn) {
        throw new Error('EngineStore is not connected to a store yet');
    }
    return dispatchFn(action);
}
