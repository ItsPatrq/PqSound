import * as EngineStore from './EngineStore';

/**
 * Fake store: `setState` swaps the state and notifies subscribers, the way
 * Redux does after a dispatch.
 */
const makeStore = (initial: any) => {
    let state = initial;
    const listeners: (() => void)[] = [];
    return {
        getState: () => state,
        dispatch: jest.fn(),
        subscribe: (listener: () => void) => {
            listeners.push(listener);
            return () => listeners.splice(listeners.indexOf(listener), 1);
        },
        setState: (next: any) => {
            state = next;
            listeners.forEach((listener) => listener());
        },
    };
};

const makeState = ({ bpm = 120, trackList = [] as any[], notesPlaying = [] as number[] } = {}) => ({
    control: { BPM: bpm },
    composition: { loopEnabled: false, loopStart: 0, loopEnd: 0, regionList: [] },
    tracks: { trackList },
    keyboard: { notesPlaying },
});

describe('EngineStore', () => {
    afterEach(() => {
        EngineStore.disconnectStore();
    });

    it('serves an empty snapshot before a store is connected', () => {
        expect(EngineStore.getSnapshot().tracks).toEqual([]);
        expect(EngineStore.getSnapshot().regionList).toEqual([]);
    });

    it('throws on dispatch until a store is connected', () => {
        expect(() => EngineStore.dispatch({ type: 'ANY' })).toThrow('EngineStore is not connected to a store yet');
    });

    it('projects the connected store immediately', () => {
        const store = makeStore(makeState({ bpm: 90, trackList: [{ index: 1, id: 7, record: true }] }));

        EngineStore.connectStore(store);

        expect(EngineStore.getSnapshot().bpm).toBe(90);
        expect(EngineStore.getSnapshot().tracks).toEqual([{ index: 1, id: 7, record: true }]);
    });

    it('refreshes the snapshot when the store changes', () => {
        const store = makeStore(makeState({ bpm: 120 }));
        EngineStore.connectStore(store);

        store.setState(makeState({ bpm: 140, notesPlaying: [60] }));

        expect(EngineStore.getSnapshot().bpm).toBe(140);
        expect(EngineStore.getSnapshot().notesPlaying).toEqual([60]);
    });

    it('exposes only the engine-facing shape, not raw state', () => {
        const store = makeStore(makeState({ trackList: [{ index: 0, id: 0, record: false, instrument: {} }] }));

        EngineStore.connectStore(store);

        const snapshot = EngineStore.getSnapshot() as any;
        expect(snapshot.tracks[0]).toEqual({ index: 0, id: 0, record: false });
        expect(snapshot.control).toBeUndefined();
    });

    it('forwards dispatch and returns what the store returns', () => {
        const store = makeStore(makeState());
        store.dispatch.mockReturnValue('dispatched');
        EngineStore.connectStore(store);

        expect(EngineStore.dispatch({ type: 'PLAY' })).toBe('dispatched');
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'PLAY' });
    });

    it('drops the snapshot on disconnect', () => {
        EngineStore.connectStore(makeStore(makeState({ bpm: 200 })));

        EngineStore.disconnectStore();

        expect(EngineStore.getSnapshot().bpm).toBe(120);
    });
});
