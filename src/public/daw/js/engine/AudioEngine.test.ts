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

    describe('plugins', () => {
        it('hands back the same array instance it was given (the Track node holds it)', () => {
            const plugins: any[] = [];

            const registered = AudioEngine.setPlugins(1, plugins);

            expect(registered).toBe(plugins);
            expect(AudioEngine.getPlugins(1)).toBe(plugins);
        });

        it('returns an empty array for an unknown track', () => {
            expect(AudioEngine.getPlugins(42)).toEqual([]);
        });

        it('appends in place so the node sees the addition', () => {
            const plugins: any[] = [];
            AudioEngine.setPlugins(1, plugins);

            AudioEngine.addPlugin(1, { id: 0, index: 0 });

            expect(plugins).toHaveLength(1);
        });

        it('removes by the plugin index and renumbers the rest in place', () => {
            const plugins = [
                { id: 0, index: 0 },
                { id: 1, index: 1 },
                { id: 2, index: 2 },
            ];
            AudioEngine.setPlugins(1, plugins);

            AudioEngine.removePlugin(1, 1);

            expect(plugins.map((plugin) => plugin.id)).toEqual([0, 2]);
            expect(plugins.map((plugin) => plugin.index)).toEqual([0, 1]);
        });

        it('ignores a removal for a plugin index that is not there', () => {
            const plugins = [{ id: 0, index: 0 }];
            AudioEngine.setPlugins(1, plugins);

            AudioEngine.removePlugin(1, 5);

            expect(plugins).toHaveLength(1);
        });

        it('forwards a preset to the addressed plugin only', () => {
            const first = { index: 0, updatePreset: jest.fn() };
            const second = { index: 1, updatePreset: jest.fn() };
            AudioEngine.setPlugins(1, [first, second]);

            AudioEngine.updatePluginPreset(1, 1, { gain: 2 });

            expect(second.updatePreset).toHaveBeenCalledWith({ gain: 2 });
            expect(first.updatePreset).not.toHaveBeenCalled();
        });

        it("drops one track's chain and clears them all", () => {
            AudioEngine.setPlugins(1, [{}]);
            AudioEngine.setPlugins(2, [{}]);

            AudioEngine.removePlugins(1);
            expect(AudioEngine.getPlugins(1)).toEqual([]);
            expect(AudioEngine.getPlugins(2)).toHaveLength(1);

            AudioEngine.clearPlugins();
            expect(AudioEngine.getPlugins(2)).toEqual([]);
        });
    });

    /**
     * #249: dropping a registry entry does not detach anything — the Web Audio
     * graph is an owning reference, so an undisconnected node stays alive and
     * audible after its track is gone. These pin that every removal path tears
     * the graph down rather than leaving it to the caller.
     */
    describe('teardown on removal', () => {
        const makePlugin = (index: number) => ({
            index,
            input: { disconnect: jest.fn() },
            output: { disconnect: jest.fn() },
        });
        const makeInstrument = () => ({ disconnect: jest.fn(), stopAll: jest.fn() });

        it('disposes a track node when it is removed', () => {
            const node: any = { dispose: jest.fn() };
            AudioEngine.setTrackNode(7, node);

            AudioEngine.removeTrackNode(7);

            expect(node.dispose).toHaveBeenCalled();
            expect(AudioEngine.getTrackNode(7)).toBeUndefined();
        });

        it('disposes every track node on clear', () => {
            const a: any = { dispose: jest.fn() };
            const b: any = { dispose: jest.fn() };
            AudioEngine.setTrackNode(1, a);
            AudioEngine.setTrackNode(2, b);

            AudioEngine.clearTrackNodes();

            expect(a.dispose).toHaveBeenCalled();
            expect(b.dispose).toHaveBeenCalled();
        });

        it('silences and detaches an instrument when it is removed', () => {
            const instrument = makeInstrument();
            AudioEngine.setInstrument(3, instrument);

            AudioEngine.removeInstrument(3);

            expect(instrument.stopAll).toHaveBeenCalled();
            expect(instrument.disconnect).toHaveBeenCalled();
        });

        it('detaches a single plugin before it leaves the chain', () => {
            const keep = makePlugin(0);
            const drop = makePlugin(1);
            AudioEngine.setPlugins(4, [keep, drop]);

            AudioEngine.removePlugin(4, 1);

            expect(drop.input.disconnect).toHaveBeenCalled();
            expect(drop.output.disconnect).toHaveBeenCalled();
            // The surviving plugin keeps its edges; updateTrackNode rewires it.
            expect(keep.output.disconnect).not.toHaveBeenCalled();
            expect(AudioEngine.getPlugins(4)).toHaveLength(1);
        });

        it('detaches the whole chain on removePlugins and clearPlugins', () => {
            const one = makePlugin(0);
            const two = makePlugin(0);
            AudioEngine.setPlugins(5, [one]);
            AudioEngine.setPlugins(6, [two]);

            AudioEngine.removePlugins(5);
            AudioEngine.clearPlugins();

            expect(one.output.disconnect).toHaveBeenCalled();
            expect(two.output.disconnect).toHaveBeenCalled();
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
