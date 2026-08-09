import Track from './Track';

/**
 * A plugin node exposes `input`/`output` AudioNode-likes; the plugin wrapper
 * returns them via getPluginNode(). We only need `connect` to be observable to
 * assert how getPluginChainNode wires the chain.
 */
const makePluginNode = (label: string) => {
    const input = { label: `${label}.input`, connect: jest.fn(), disconnect: jest.fn() };
    const output = { label: `${label}.output`, connect: jest.fn(), disconnect: jest.fn() };
    return {
        input,
        output,
        getPluginNode: jest.fn(() => ({ input, output })),
    };
};

/**
 * Build a Track without touching Web Audio: passing a null AudioContext makes
 * the constructor skip initAudioContext's node creation, leaving only the
 * pluginNodeList that getPluginChainNode operates on.
 */
const makeTrack = (pluginNodeList: any[]) => new Track(pluginNodeList, null, undefined, null as any);

/** Minimal AudioNode stand-in: only connect/disconnect need to be observable. */
const makeNode = (label: string) => ({ label, connect: jest.fn(), disconnect: jest.fn() });

/**
 * Enough of an AudioContext for initAudioContext to build a full node graph.
 * jsdom has no Web Audio, so the nodes are stubs.
 */
const makeContext = () => {
    const created: ReturnType<typeof makeNode>[] = [];
    const make = (label: string) => {
        const node = makeNode(label);
        created.push(node);
        return node;
    };
    return {
        created,
        currentTime: 0,
        destination: makeNode('destination'),
        createGain: () => ({ ...make('gain'), gain: { setValueAtTime: jest.fn() } }),
        createStereoPanner: () => ({ ...make('pan'), pan: { setValueAtTime: jest.fn() } }),
        createAnalyser: () => ({ ...make('analyser'), smoothingTimeConstant: 0, fftSize: 0 }),
        createChannelSplitter: () => make('splitter'),
    };
};

describe('Track.dispose', () => {
    it('disconnects its own nodes, its plugins and its instrument', () => {
        const context: any = makeContext();
        const instrument = { connect: jest.fn(), disconnect: jest.fn(), stopAll: jest.fn() };
        const plugin = makePluginNode('p0');
        const track = new Track([plugin], instrument, undefined, context);

        track.dispose();

        // Anything still ringing is silenced before the instrument is detached.
        expect(instrument.stopAll).toHaveBeenCalled();
        expect(instrument.disconnect).toHaveBeenCalled();
        expect(plugin.input.disconnect).toHaveBeenCalled();
        expect(plugin.output.disconnect).toHaveBeenCalled();
        // gain, pan, splitter and both analysers all created through the context.
        context.created.forEach((node: any) => expect(node.disconnect).toHaveBeenCalled());
    });

    it('is safe to call twice and on a track with no instrument', () => {
        const context: any = makeContext();
        const track = new Track([], null, undefined, context);

        expect(() => {
            track.dispose();
            track.dispose();
        }).not.toThrow();
    });
});

describe('Track.getPluginChainNode', () => {
    // The null-context constructor path logs "Error initializing track" via
    // devLog (console.warn) by design; silence it to keep test output clean.
    let warnSpy: jest.SpyInstance;
    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    it("exposes the sole plugin's input and output for a single-plugin chain", () => {
        const p0 = makePluginNode('p0');
        const track = makeTrack([p0]);

        const chain = track.getPluginChainNode();

        expect(chain.input).toBe(p0.input);
        expect(chain.output).toBe(p0.output);
        expect(p0.output.connect).not.toHaveBeenCalled();
    });

    it('chains plugins output->input and returns first input / last output', () => {
        const p0 = makePluginNode('p0');
        const p1 = makePluginNode('p1');
        const p2 = makePluginNode('p2');
        const track = makeTrack([p0, p1, p2]);

        const chain = track.getPluginChainNode();

        // p0.output -> p1.input, p1.output -> p2.input
        expect(p0.output.connect).toHaveBeenCalledWith(p1.input);
        expect(p1.output.connect).toHaveBeenCalledWith(p2.input);
        expect(p2.output.connect).not.toHaveBeenCalled();

        expect(chain.input).toBe(p0.input);
        expect(chain.output).toBe(p2.output);
    });

    it('reads each plugin node fresh via getPluginNode', () => {
        const p0 = makePluginNode('p0');
        const p1 = makePluginNode('p1');
        const track = makeTrack([p0, p1]);

        track.getPluginChainNode();

        expect(p0.getPluginNode).toHaveBeenCalled();
        expect(p1.getPluginNode).toHaveBeenCalled();
    });
});
