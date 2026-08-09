/**
 * Fetches and decodes a list of sample URLs, calling back once when the batch
 * is finished.
 *
 * Two failure modes this used to have (#253):
 *
 *  - `XMLHttpRequest.onload` fires for *any* completed response, including 404,
 *    429 and 500. The error body was handed to `decodeAudioData`, which failed,
 *    and the failure path re-requested immediately — no status check, no cap,
 *    no backoff. A rate-limited client would keep itself rate-limited.
 *  - The completion callback only ran on `++loadCount === urlList.length`, and
 *    nothing else ever called it, so a single permanently failing sample left
 *    the instrument stuck in `fetching` for the rest of the session with no
 *    retry path and no error surfaced.
 *
 * Now every URL settles exactly once, whether it loaded or gave up, and retries
 * are bounded and backed off. Giving up leaves a hole in `bufferList`, which is
 * already handled: `Sampler.noteOn` skips a note whose buffer is missing. A
 * mostly-loaded instrument is far better than one that never reports at all.
 */
export class BufferLoader {
    /** Attempts per URL, including the first. */
    static readonly MAX_ATTEMPTS = 3;
    /** Backoff base; doubles per retry (250 ms, 500 ms). */
    static readonly RETRY_BASE_MS = 250;
    /** Above this many in-flight requests, new ones wait rather than pile on. */
    static readonly MAX_ACTIVE_FETCHING = 4;

    context: AudioContext;
    urlList: string[];
    onload: (bufferLoader: BufferLoader) => void;
    loadCount: number;
    bufferList: AudioBuffer[];
    activeFetching: number;
    /** Attempts spent per index, and whether that index has settled. */
    private attempts: number[];
    private settled: boolean[];

    constructor(context: AudioContext, urlList: string[], callback: (bufferLoader: BufferLoader) => void) {
        this.context = context;
        this.urlList = urlList;
        this.onload = callback;
        this.timoutLoad = this.timoutLoad.bind(this);
        this.bufferList = [];
        this.loadCount = 0;
        this.activeFetching = 0;
        this.attempts = [];
        this.settled = [];
    }

    /**
     * Marks one URL as finished — loaded or abandoned — and fires the batch
     * callback once every URL has settled. Idempotent per index, so a late
     * decode callback cannot double-count.
     */
    private settle(index: number): void {
        if (this.settled[index]) {
            return;
        }
        this.settled[index] = true;
        if (++this.loadCount === this.urlList.length) {
            this.onload(this);
        }
    }

    /** Retries with backoff until the attempt budget runs out, then settles. */
    private retryOrGiveUp(url: string, index: number): void {
        const attempt = (this.attempts[index] = (this.attempts[index] || 0) + 1);
        if (attempt >= BufferLoader.MAX_ATTEMPTS) {
            console.warn(`BufferLoader: giving up on ${url} after ${attempt} attempts`);
            this.settle(index);
            return;
        }
        setTimeout(() => this.timoutLoad(url, index), BufferLoader.RETRY_BASE_MS * Math.pow(2, attempt - 1));
    }

    loadBuffer(url: string, index: number): void {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = (): void => {
            this.activeFetching--;
            // onload fires for 404/429/500 too; only a 2xx body is worth decoding.
            if (request.status < 200 || request.status >= 300) {
                console.warn(`BufferLoader: ${request.status} for ${url}`);
                this.retryOrGiveUp(url, index);
                return;
            }
            this.context.decodeAudioData(
                request.response,
                (buffer) => {
                    if (!buffer) {
                        console.warn('BufferLoader: empty buffer decoding ' + url);
                        this.retryOrGiveUp(url, index);
                        return;
                    }
                    this.bufferList[index] = buffer;
                    this.settle(index);
                },
                (error) => {
                    console.warn('BufferLoader: decodeAudioData error', error);
                    this.retryOrGiveUp(url, index);
                },
            );
        };

        request.onerror = (): void => {
            this.activeFetching--;
            this.retryOrGiveUp(url, index);
        };

        this.activeFetching++;
        return request.send();
    }

    load(): void {
        this.bufferList.length = 0;
        for (let i = 0; i < this.urlList.length; ++i) {
            this.timoutLoad(this.urlList[i], i);
        }
    }

    timoutLoad(url: string, index: number): void {
        if (this.activeFetching > BufferLoader.MAX_ACTIVE_FETCHING) {
            setTimeout(() => this.timoutLoad(url, index), 1000);
        } else {
            this.loadBuffer(url, index);
        }
    }
}

export default BufferLoader;
