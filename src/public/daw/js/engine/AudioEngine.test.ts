import AudioEngine from './AudioEngine';

// Sound's constructor resumes the context; keep it inert so these tests only
// exercise AudioEngine's own bookkeeping.
jest.mock('./Sound', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((context) => ({ context })),
}));

class FakeAudioContext {
    state = 'suspended';
    sampleRate = 44100;
    resume = jest.fn(() => {
        this.state = 'running';
    });
}

describe('AudioEngine', () => {
    let contexts: FakeAudioContext[];

    beforeEach(() => {
        contexts = [];
        (global as any).AudioContext = jest.fn(() => {
            const context = new FakeAudioContext();
            contexts.push(context);
            return context;
        });
        AudioEngine.reset();
    });

    afterEach(() => {
        AudioEngine.reset();
        delete (global as any).AudioContext;
    });

    describe('init', () => {
        it('creates the context and the Sound dispatcher', () => {
            expect(AudioEngine.isInitialized()).toBe(false);

            expect(AudioEngine.init()).toBe(true);

            expect(AudioEngine.isInitialized()).toBe(true);
            expect(AudioEngine.getContext()).toBe(contexts[0]);
            expect(AudioEngine.getSound()).not.toBeNull();
            expect(AudioEngine.getSampleRate()).toBe(44100);
        });

        it('is idempotent — a second call keeps the existing context', () => {
            AudioEngine.init();
            const firstContext = AudioEngine.getContext();

            AudioEngine.init();

            expect(contexts).toHaveLength(1);
            expect(AudioEngine.getContext()).toBe(firstContext);
        });

        it('reports failure and stays uninitialized when Web Audio is unavailable', () => {
            (global as any).AudioContext = jest.fn(() => {
                throw new Error('not supported');
            });
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

            expect(AudioEngine.init()).toBe(false);

            expect(AudioEngine.isInitialized()).toBe(false);
            expect(AudioEngine.getContext()).toBeNull();
            expect(AudioEngine.getSound()).toBeNull();
            expect(AudioEngine.getSampleRate()).toBeNull();
            consoleError.mockRestore();
        });
    });

    describe('resume', () => {
        it('resumes a suspended context', () => {
            AudioEngine.init();

            AudioEngine.resume();

            expect(contexts[0].resume).toHaveBeenCalledTimes(1);
        });

        it('leaves a running context alone', () => {
            AudioEngine.init();
            contexts[0].state = 'running';

            AudioEngine.resume();

            expect(contexts[0].resume).not.toHaveBeenCalled();
        });

        it('is a no-op before init', () => {
            expect(() => AudioEngine.resume()).not.toThrow();
        });
    });

    describe('sequencer and MIDI controller registry', () => {
        it('hands back whatever the app shell registered', () => {
            const sequencer = { handlePlay: jest.fn() } as any;
            const midiController = { init: jest.fn() } as any;

            AudioEngine.setSequencer(sequencer);
            AudioEngine.setMidiController(midiController);

            expect(AudioEngine.getSequencer()).toBe(sequencer);
            expect(AudioEngine.getMidiController()).toBe(midiController);
        });

        it('returns null before anything is registered', () => {
            expect(AudioEngine.getSequencer()).toBeNull();
            expect(AudioEngine.getMidiController()).toBeNull();
        });

        it('drops both on reset', () => {
            AudioEngine.setSequencer({} as any);
            AudioEngine.setMidiController({} as any);

            AudioEngine.reset();

            expect(AudioEngine.getSequencer()).toBeNull();
            expect(AudioEngine.getMidiController()).toBeNull();
        });
    });

    describe('instruments', () => {
        it('stores and returns the live instrument for a track id', () => {
            const instrument = { noteOn: jest.fn() };

            AudioEngine.setInstrument(3, instrument);

            expect(AudioEngine.getInstrument(3)).toBe(instrument);
        });

        it('treats a null instrument as a removal (aux tracks have none)', () => {
            AudioEngine.setInstrument(3, { noteOn: jest.fn() });

            AudioEngine.setInstrument(3, null);

            expect(AudioEngine.getInstrument(3)).toBeUndefined();
        });

        it('removes and clears', () => {
            AudioEngine.setInstrument(3, {});
            AudioEngine.setInstrument(4, {});

            AudioEngine.removeInstrument(3);
            expect(AudioEngine.getInstrument(3)).toBeUndefined();
            expect(AudioEngine.getInstrument(4)).toBeDefined();

            AudioEngine.clearInstruments();
            expect(AudioEngine.getInstrument(4)).toBeUndefined();
        });
    });

    describe('instrument buffers', () => {
        it('stores and returns buffers by instrument name', () => {
            const buffers = [{} as AudioBuffer, {} as AudioBuffer];

            AudioEngine.setInstrumentBuffers('DSKGrandPiano', buffers);

            expect(AudioEngine.getInstrumentBuffers('DSKGrandPiano')).toBe(buffers);
        });

        it('returns undefined for an instrument that has not been loaded', () => {
            expect(AudioEngine.getInstrumentBuffers('RockKit')).toBeUndefined();
        });

        it('drops buffers on reset', () => {
            AudioEngine.setInstrumentBuffers('RockKit', [{} as AudioBuffer]);

            AudioEngine.reset();

            expect(AudioEngine.getInstrumentBuffers('RockKit')).toBeUndefined();
        });
    });
});
