import MultiOsc from './MultiOsc';
import Monotron from './Monotron';

/**
 * #266: every voice built its own output GainNode, connected it to the
 * instrument, and never disconnected it. `noteOff` drops the JS reference, but
 * the graph edge is itself an owning reference, so one gain node per note
 * played stayed live and traversed every render quantum.
 *
 * The doubles below reject a non-node `connect` argument and record every node
 * the context creates, so a voice that fails to release something is visible.
 * A permissive double is how #264 nearly shipped a test that passed against
 * unfixed code.
 */
const param = () => ({
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
});

const created: any[] = [];

function makeNode(kind: string, extra: Record<string, unknown> = {}) {
    const node = {
        kind,
        connect: jest.fn((target: unknown) => {
            if (!target) {
                throw new TypeError(
                    "Failed to execute 'connect' on 'AudioNode': parameter 1 is not of type 'AudioNode'.",
                );
            }
        }),
        disconnect: jest.fn(),
        ...extra,
    };
    created.push(node);
    return node;
}

const makeContext = (): any => ({
    currentTime: 0,
    sampleRate: 44100,
    createGain: () => makeNode('gain', { gain: param() }),
    createOscillator: () =>
        makeNode('oscillator', { frequency: param(), detune: param(), type: '', start: jest.fn(), stop: jest.fn() }),
    createBiquadFilter: () => makeNode('filter', { frequency: param(), gain: param(), Q: param(), type: '' }),
    createBufferSource: () => makeNode('buffersource', { buffer: null, start: jest.fn(), stop: jest.fn() }),
    createBuffer: () => ({ getChannelData: () => new Float32Array(1024) }),
});

const gainsOf = () => created.filter((node) => node.kind === 'gain');
const sourcesOf = () => created.filter((node) => node.kind === 'oscillator' || node.kind === 'buffersource');

describe('voice teardown', () => {
    beforeEach(() => {
        created.length = 0;
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    it('MultiOsc releases the voice output and stops its oscillators', () => {
        const instrument = new MultiOsc(undefined, makeContext());
        // The instrument's own output gain is created first; ignore it.
        const before = gainsOf().length;

        instrument.noteOn(60, 0);
        const voiceGain = gainsOf()[before];
        expect(voiceGain).toBeDefined();

        instrument.noteOff(60, 0);
        jest.runAllTimers();

        // The leak: this used to stay connected to the instrument forever.
        expect(voiceGain.disconnect).toHaveBeenCalled();
        sourcesOf().forEach((source: any) => expect(source.stop).toHaveBeenCalled());
    });

    it('Monotron releases the voice output too', () => {
        const instrument = new Monotron(undefined, makeContext());
        const before = gainsOf().length;

        instrument.noteOn(60, 0);
        const voiceGain = gainsOf()[before];

        instrument.noteOff(60, 0);
        jest.runAllTimers();

        expect(voiceGain.disconnect).toHaveBeenCalled();
    });

    it('tears down after the release ramp, not before it', () => {
        const context = makeContext();
        const instrument = new MultiOsc(undefined, context);
        const before = gainsOf().length;
        instrument.noteOn(60, 0);
        const voiceGain = gainsOf()[before];

        // release defaults to 0.5s, so nothing should happen at 100ms.
        instrument.noteOff(60, 0);
        jest.advanceTimersByTime(100);
        expect(voiceGain.disconnect).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);
        expect(voiceGain.disconnect).toHaveBeenCalled();
    });

    it('does not schedule a negative delay when the stop time is already past', () => {
        const context = makeContext();
        context.currentTime = 10;
        const instrument = new MultiOsc(undefined, context);
        const before = gainsOf().length;
        instrument.noteOn(60, 10);
        const voiceGain = gainsOf()[before];

        // Stop scheduled in the past: the old expression went negative and fired
        // immediately, cutting the voice mid-ramp.
        instrument.noteOff(60, 5);
        expect(voiceGain.disconnect).not.toHaveBeenCalled();
        jest.advanceTimersByTime(0);
        expect(voiceGain.disconnect).toHaveBeenCalled();
    });
});
