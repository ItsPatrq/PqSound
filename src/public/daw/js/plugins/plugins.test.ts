import Chorus from './Chorus';
import Delay from './Delay';
import Equalizer from './Equalizer';

/**
 * #253: two plugin defects that the UI cannot trigger — the Delay slider starts
 * at 1 and the EQ exposes only its three gains — but an imported composition
 * carries whatever preset the file holds, and `loadTrackState` feeds it straight
 * to `updatePreset`. These pin the behaviour for values the UI will not produce.
 */
const param = () => ({ setValueAtTime: jest.fn(), value: 0 });

const makeNode = (extra: Record<string, unknown> = {}) => ({
    // Real AudioNode.connect rejects a non-node argument. A permissive double
    // would have let the `iterations: 0` case pass against the unfixed code,
    // which is the whole defect.
    connect: jest.fn((target: unknown) => {
        if (!target) {
            throw new TypeError("Failed to execute 'connect' on 'AudioNode': parameter 1 is not of type 'AudioNode'.");
        }
    }),
    disconnect: jest.fn(),
    ...extra,
});

/** Every node the fake context hands out, so teardown can be checked in full. */
const created: any[] = [];

const track = (node: any) => {
    created.push(node);
    return node;
};

const makeContext = (): any => ({
    currentTime: 0,
    createGain: () => track(makeNode({ gain: param() })),
    createDelay: () => track(makeNode({ delayTime: param() })),
    createBiquadFilter: () => track(makeNode({ frequency: param(), gain: param(), type: '' })),
    createOscillator: () => track(makeNode({ frequency: param(), type: '', start: jest.fn(), stop: jest.fn() })),
    createChannelSplitter: () => track(makeNode()),
    createChannelMerger: () => track(makeNode()),
});

describe('Delay', () => {
    it('builds a delay line per iteration', () => {
        const delay = new Delay(0, makeContext());

        // Four nodes per iteration: delay, feedback, highcut, lowcut.
        expect(delay.delayArray).toHaveLength(10 * 4);
    });

    it('survives a preset with no delay lines at all', () => {
        const delay = new Delay(0, makeContext());

        // Threw `Failed to execute 'connect'` on delayArray[0] before the guard,
        // out of updatePreset and through the dispatching thunk.
        expect(() => delay.updatePreset({ iterations: 0 })).not.toThrow();
        expect(delay.delayArray).toHaveLength(0);
    });

    it('rebuilds when the iteration count changes and can come back from zero', () => {
        const delay = new Delay(0, makeContext());

        delay.updatePreset({ iterations: 0 });
        delay.updatePreset({ iterations: 3 });

        expect(delay.delayArray).toHaveLength(3 * 4);
    });
});

describe('Equalizer', () => {
    it('applies the band splits and shelf gain on a preset change, not only at construction', () => {
        const equalizer: any = new Equalizer(0, makeContext());
        equalizer.hBand.frequency.setValueAtTime.mockClear();
        equalizer.lBand.frequency.setValueAtTime.mockClear();
        equalizer.hBand.gain.setValueAtTime.mockClear();

        equalizer.updatePreset({ lowBandSplit: 500, highBandSplit: 5000, gainDb: -20 });

        expect(equalizer.hBand.frequency.setValueAtTime).toHaveBeenCalledWith(500, 0);
        expect(equalizer.lBand.frequency.setValueAtTime).toHaveBeenCalledWith(5000, 0);
        expect(equalizer.hBand.gain.setValueAtTime).toHaveBeenCalledWith(-20, 0);
    });

    it('still applies the three band gains the UI edits', () => {
        const equalizer: any = new Equalizer(0, makeContext());

        equalizer.updatePreset({ lowFilterGain: 0.5, midFilterGain: 0.25, highFilterGain: 2 });

        expect(equalizer.lGain.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
        expect(equalizer.mGain.gain.setValueAtTime).toHaveBeenCalledWith(0.25, 0);
        expect(equalizer.hGain.gain.setValueAtTime).toHaveBeenCalledWith(2, 0);
    });
});

/**
 * #276: teardown released `input` and `output` only, so each plugin's internal
 * graph stayed wired together after removal — and Chorus's LFO oscillator,
 * started in the constructor and never stopped, kept running for the life of
 * the page while still driving both delay lines' delayTime params.
 */
describe('plugin disposal', () => {
    beforeEach(() => {
        created.length = 0;
    });

    it('Chorus stops its LFO oscillator', () => {
        const chorus: any = new Chorus(0, makeContext());
        expect(chorus.osc.start).toHaveBeenCalled();

        chorus.dispose();

        // The leak: started in the constructor, never stopped, never collectable.
        expect(chorus.osc.stop).toHaveBeenCalled();
        expect(chorus.osc.disconnect).toHaveBeenCalled();
    });

    it('Chorus releases every node it built, not just input and output', () => {
        const chorus: any = new Chorus(0, makeContext());
        const built = [...created];
        expect(built.length).toBeGreaterThan(5);

        chorus.dispose();

        built.forEach((node) => expect(node.disconnect).toHaveBeenCalled());
    });

    it('Delay releases the delay lines it keeps in an array', () => {
        const delay: any = new Delay(0, makeContext());
        const lines = [...delay.delayArray];
        expect(lines.length).toBeGreaterThan(0);

        delay.dispose();

        lines.forEach((node: any) => expect(node.disconnect).toHaveBeenCalled());
    });

    it('is safe to call twice', () => {
        const equalizer: any = new Equalizer(0, makeContext());

        expect(() => {
            equalizer.dispose();
            equalizer.dispose();
        }).not.toThrow();
    });
});
