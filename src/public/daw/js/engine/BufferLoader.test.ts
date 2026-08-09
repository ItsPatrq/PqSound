import BufferLoader from './BufferLoader';

/**
 * #253: a non-2xx response used to be fed to decodeAudioData, whose failure
 * path re-requested immediately — no status check, no cap, no backoff — and a
 * permanently failing sample never settled, so the instrument stayed
 * `fetching` for the rest of the session.
 */
type FakeRequest = {
    url: string;
    status: number;
    response: any;
    onload: (() => void) | null;
    onerror: (() => void) | null;
    open: jest.Mock;
    send: jest.Mock;
};

const requests: FakeRequest[] = [];

class FakeXHR {
    url = '';
    status = 200;
    response: any = new ArrayBuffer(8);
    responseType = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    open = jest.fn((_method: string, url: string) => {
        this.url = url;
    });
    send = jest.fn();

    constructor() {
        requests.push(this as unknown as FakeRequest);
    }
}

/** Decode outcome per call, so a test can make a URL fail for good. */
let decodeShouldFail = false;

const makeContext = () =>
    ({
        decodeAudioData: jest.fn((_data: any, success: any, failure: any) => {
            if (decodeShouldFail) {
                failure(new Error('not audio'));
            } else {
                success({ duration: 1 } as any);
            }
        }),
    }) as any;

describe('BufferLoader', () => {
    beforeEach(() => {
        requests.length = 0;
        decodeShouldFail = false;
        jest.useFakeTimers();
        (global as any).XMLHttpRequest = FakeXHR;
    });
    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('calls back once every url has loaded', () => {
        const done = jest.fn();
        const loader = new BufferLoader(makeContext(), ['a.wav', 'b.wav'], done);

        loader.load();
        requests.forEach((request) => request.onload!());

        expect(done).toHaveBeenCalledTimes(1);
        expect(loader.bufferList).toHaveLength(2);
    });

    it('does not decode a non-2xx body, and retries with backoff instead', () => {
        const context = makeContext();
        const loader = new BufferLoader(context, ['a.wav'], jest.fn());
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        loader.load();
        requests[0].status = 429;
        requests[0].onload!();

        // The error body must never reach the decoder.
        expect(context.decodeAudioData).not.toHaveBeenCalled();
        // And the retry is scheduled, not fired inline — this is what used to
        // be a tight request loop against a rate-limited server.
        expect(requests).toHaveLength(1);
        jest.advanceTimersByTime(250);
        expect(requests).toHaveLength(2);
    });

    it('gives up after a bounded number of attempts rather than looping forever', () => {
        const loader = new BufferLoader(makeContext(), ['a.wav'], jest.fn());
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        loader.load();
        for (let i = 0; i < 10; i++) {
            const request = requests[requests.length - 1];
            request.status = 500;
            request.onload!();
            jest.advanceTimersByTime(5000);
        }

        expect(requests).toHaveLength(BufferLoader.MAX_ATTEMPTS);
    });

    it('still reports the batch as finished when one url never loads', () => {
        const done = jest.fn();
        const loader = new BufferLoader(makeContext(), ['good.wav', 'bad.wav'], done);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);

        loader.load();
        // First url succeeds.
        requests[0].onload!();
        // Second fails every attempt.
        for (let i = 0; i < BufferLoader.MAX_ATTEMPTS; i++) {
            const request = requests[requests.length - 1];
            request.status = 404;
            request.onload!();
            jest.advanceTimersByTime(5000);
        }

        // The instrument used to hang in `fetching` here, forever.
        expect(done).toHaveBeenCalledTimes(1);
        // The good sample is present; the bad one is a hole, which
        // Sampler.noteOn already skips.
        expect(loader.bufferList[0]).toBeDefined();
        expect(loader.bufferList[1]).toBeUndefined();
    });

    it('settles a url that fails to decode as audio', () => {
        const done = jest.fn();
        const loader = new BufferLoader(makeContext(), ['a.wav'], done);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        decodeShouldFail = true;

        loader.load();
        for (let i = 0; i < BufferLoader.MAX_ATTEMPTS; i++) {
            requests[requests.length - 1].onload!();
            jest.advanceTimersByTime(5000);
        }

        expect(done).toHaveBeenCalledTimes(1);
    });

    it('retries a transport error too', () => {
        const loader = new BufferLoader(makeContext(), ['a.wav'], jest.fn());

        loader.load();
        requests[0].onerror!();
        jest.advanceTimersByTime(250);

        expect(requests).toHaveLength(2);
    });
});
