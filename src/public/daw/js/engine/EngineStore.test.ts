import * as EngineStore from './EngineStore';

describe('EngineStore', () => {
    afterEach(() => {
        EngineStore.disconnectStore();
    });

    it('throws until a store is connected', () => {
        expect(() => EngineStore.getState()).toThrow('EngineStore is not connected to a store yet');
        expect(() => EngineStore.dispatch({ type: 'ANY' })).toThrow('EngineStore is not connected to a store yet');
    });

    it('reads through to the connected store on every call', () => {
        const store = { getState: jest.fn(() => ({ tick: 1 })), dispatch: jest.fn() };
        EngineStore.connectStore(store);

        expect(EngineStore.getState()).toEqual({ tick: 1 });

        // Not a snapshot: a later call sees the newer state.
        store.getState.mockReturnValue({ tick: 2 });
        expect(EngineStore.getState()).toEqual({ tick: 2 });
        expect(store.getState).toHaveBeenCalledTimes(2);
    });

    it('forwards dispatch and returns what the store returns', () => {
        const store = { getState: jest.fn(), dispatch: jest.fn(() => 'dispatched') };
        EngineStore.connectStore(store);

        expect(EngineStore.dispatch({ type: 'PLAY' })).toBe('dispatched');
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'PLAY' });
    });

    it('replaces the connection when connected again', () => {
        const first = { getState: jest.fn(() => 'first'), dispatch: jest.fn() };
        const second = { getState: jest.fn(() => 'second'), dispatch: jest.fn() };

        EngineStore.connectStore(first);
        EngineStore.connectStore(second);

        expect(EngineStore.getState()).toBe('second');
        expect(first.getState).not.toHaveBeenCalled();
    });
});
