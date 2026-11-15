/**
 * @jest-environment jsdom
 */
import Juno from './Juno';
import { Instruments } from '../constants/Constants';
import { Utils } from './index';
import { defaultPatch } from './juno/JunoPatch';
import { JUNO_PROCESSOR, JUNO_WORKLET_URL } from './juno/JunoMessages';
import { publicPath } from '../../../../webpackCfg/publicPath';
import { TEST_PATCHES } from './juno/reference/testPatches';

/**
 * The main-thread half of the Juno: worklet loading, message forwarding and
 * node lifecycle. The DSP itself is covered by juno/JunoEngine.test.ts and
 * the sound by juno/JunoReference.test.ts.
 */

class FakeNode {
    static created: FakeNode[] = [];
    posted: unknown[] = [];
    connected: unknown[] = [];
    closed = false;
    port = {
        postMessage: (m: unknown) => this.posted.push(m),
        close: () => (this.closed = true),
    };
    constructor(
        public context: unknown,
        public name: string,
        public options: any,
    ) {
        FakeNode.created.push(this);
    }
    connect(t: unknown) {
        this.connected.push(t);
    }
    disconnect() {
        this.connected = [];
    }
}

const makeContext = () => {
    let resolve!: () => void;
    const loaded = new Promise<void>((r) => (resolve = r));
    const ctx: any = {
        currentTime: 1.5,
        createGain: () => ({ connect: jest.fn(), disconnect: jest.fn(), gain: { value: 1 } }),
        audioWorklet: { addModule: jest.fn(() => loaded) },
    };
    return { ctx, resolve };
};

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
    FakeNode.created = [];
    (globalThis as any).AudioWorkletNode = FakeNode;
});

describe('Juno instrument', () => {
    it('is registered with the instrument factory', () => {
        const { ctx } = makeContext();
        const inst = Utils.getNewInstrumentByIndex(Instruments.Juno.id, undefined, ctx);
        expect(inst).toBeInstanceOf(Juno);
        expect(inst.name).toBe('Juno-106');
    });

    it('loads its worklet from where webpack emits it', () => {
        expect(JUNO_WORKLET_URL).toBe(`${publicPath}juno-worklet.js`);
        const { ctx } = makeContext();
        new Juno(undefined, ctx);
        new Juno(undefined, ctx);
        expect(ctx.audioWorklet.addModule).toHaveBeenCalledTimes(1); // once per context
        expect(ctx.audioWorklet.addModule).toHaveBeenCalledWith(JUNO_WORKLET_URL);
    });

    it('keeps a serializable preset: the default patch merged with what it was given', () => {
        const { ctx } = makeContext();
        const inst = new Juno({ vcfFreq: 12 }, ctx);
        expect(inst.preset).toEqual({ ...defaultPatch, vcfFreq: 12 });
        expect(JSON.parse(JSON.stringify(inst.preset))).toEqual(inst.preset);
    });

    it('queues notes until the worklet is up, then forwards them with their timestamps', async () => {
        const { ctx, resolve } = makeContext();
        const inst = new Juno(undefined, ctx);
        inst.noteOn(60, 2.0);
        inst.updatePreset({ vcfRes: 99 });
        inst.noteOff(60, 2.5);
        expect(FakeNode.created).toHaveLength(0);

        resolve();
        await flush();
        const node = FakeNode.created[0];
        expect(node.name).toBe(JUNO_PROCESSOR);
        expect(node.options.outputChannelCount).toEqual([2]);
        // Built with the latest patch, so the queued patch message is dropped as stale.
        expect(node.options.processorOptions.patch.vcfRes).toBe(99);
        expect(node.posted).toEqual([
            { type: 'noteOn', note: 60, time: 2.0 },
            { type: 'noteOff', note: 60, time: 2.5 },
        ]);

        inst.noteOn(62);
        inst.updatePreset(TEST_PATCHES[1].patch);
        expect(node.posted.slice(2)).toEqual([
            { type: 'noteOn', note: 62, time: 1.5 },
            { type: 'patch', patch: { ...TEST_PATCHES[1].patch } },
        ]);
    });

    it('releases its node on disconnect and builds a new one if reconnected', async () => {
        const { ctx, resolve } = makeContext();
        const inst = new Juno(undefined, ctx);
        resolve();
        await flush();
        const first = FakeNode.created[0];

        inst.stopAll();
        inst.disconnect();
        expect(first.posted).toContainEqual({ type: 'allOff', time: 1.5 });
        expect(first.closed).toBe(true);
        expect(first.connected).toEqual([]);

        inst.connect({} as AudioNode);
        await flush();
        expect(FakeNode.created).toHaveLength(2);
        expect(FakeNode.created[1].connected).toEqual([inst.output]);
    });

    it('does not build a node at all if disconnected before the worklet loads', async () => {
        const { ctx, resolve } = makeContext();
        const inst = new Juno(undefined, ctx);
        inst.disconnect();
        resolve();
        await flush();
        expect(FakeNode.created).toHaveLength(0);
    });
});
