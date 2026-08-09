/**
 * @jest-environment jsdom
 */
import reducer, { initWebAudio, samplerInstrumentFetching, samplerInstrumentFetched } from 'slices/webAudioSlice';

const withInstruments = () =>
    reducer(
        undefined,
        initWebAudio({
            initialized: true,
            sampleRate: 44100,
            samplerInstrumentsSounds: [
                { id: 0, name: 'DSK Grand Piano', loaded: false, fetching: false },
                { id: 1, name: 'Rock Kit', loaded: false, fetching: false },
            ],
        }),
    ) as any;

describe('webAudioSlice', () => {
    it('starts uninitialized with no instruments', () => {
        const state = reducer(undefined, { type: '@@INIT' }) as any;

        expect(state).toEqual({ initialized: false, sampleRate: null, samplerInstrumentsSounds: [] });
    });

    it('records the engine init result and the descriptor list', () => {
        const state = withInstruments();

        expect(state.initialized).toBe(true);
        expect(state.sampleRate).toBe(44100);
        expect(state.samplerInstrumentsSounds).toHaveLength(2);
    });

    it('flags only the addressed instrument as fetching', () => {
        const before = withInstruments();

        const state = reducer(before, samplerInstrumentFetching({ instrumentId: 1 })) as any;

        expect(state.samplerInstrumentsSounds[1].fetching).toBe(true);
        expect(state.samplerInstrumentsSounds[0].fetching).toBe(false);
        // The previous state is untouched.
        expect(before.samplerInstrumentsSounds[1].fetching).toBe(false);
    });

    it('clears fetching and marks loaded when the buffers arrive', () => {
        let state = withInstruments();
        state = reducer(state, samplerInstrumentFetching({ instrumentId: 0 }));

        state = reducer(state, samplerInstrumentFetched({ id: 0 })) as any;

        expect(state.samplerInstrumentsSounds[0]).toMatchObject({ loaded: true, fetching: false });
    });

    it('ignores an instrument id that is not in the list', () => {
        const before = withInstruments();

        expect(reducer(before, samplerInstrumentFetched({ id: 99 }))).toEqual(before);
    });
});
