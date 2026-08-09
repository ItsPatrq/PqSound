import type { Server } from 'http';
import { DawApiServer } from './DawApiServer';

/**
 * #253: Fly's [http_service] fronts the app with fly-proxy, so without
 * `trust proxy` every request carries the proxy's address and
 * express-rate-limit keys them all identically — the 600/min sampler budget
 * becomes global rather than per-client. Loading one instrument is ~80
 * requests, so a handful of simultaneous first-time visitors could 429 each
 * other.
 *
 * This boots the real app and reads the draft-7 `RateLimit` header, which
 * exposes the per-key remaining count, so the bucketing is observed rather
 * than assumed.
 */
const remainingFrom = (header: string | null): number => {
    // draft-7 form: "limit=600, remaining=599, reset=60"
    const match = /remaining=(\d+)/.exec(header || '');
    return match ? Number(match[1]) : NaN;
};

describe('DawApiServer rate limiting', () => {
    let server: Server;
    let url: string;

    beforeAll(async () => {
        // Not 'local', so setupFrontEnd skips webpack entirely.
        process.env.NODE_ENV = 'test';
        const api = new DawApiServer();
        await new Promise<void>((resolve) => {
            server = api.app.listen(0, () => resolve());
        });
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : 0;
        url = `http://127.0.0.1:${port}/api/samplerinstrument/NotAnInstrument/x.wav`;
    });

    afterAll(async () => {
        await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    const call = (forwardedFor: string) => fetch(url, { headers: { 'X-Forwarded-For': forwardedFor } });

    it('gives each forwarded client its own bucket', async () => {
        // Two requests from one client, so its remaining count clearly drops.
        await call('203.0.113.10');
        const second = await call('203.0.113.10');
        const other = await call('198.51.100.77');

        const clientA = remainingFrom(second.headers.get('ratelimit'));
        const clientB = remainingFrom(other.headers.get('ratelimit'));

        expect(Number.isNaN(clientA)).toBe(false);
        // A different client must not inherit A's spend. Without `trust proxy`
        // both key to the socket address and B would continue A's count.
        expect(clientB).toBeGreaterThan(clientA);
    });

    it('keys a spoofed forwarding chain to the proxy-appended hop, not the client-chosen one', async () => {
        // A client claiming to be 1.2.3.4 behind the real proxy hop.
        await call('1.2.3.4, 203.0.113.99');
        const spoofed = await call('1.2.3.4, 203.0.113.99');
        // The same real hop, without the fabricated prefix.
        const real = await call('203.0.113.99');

        // All three share a bucket, because only the last hop is trusted. Under
        // `trust proxy: true` the first two would key to 1.2.3.4 and escape.
        expect(remainingFrom(real.headers.get('ratelimit'))).toBeLessThan(
            remainingFrom(spoofed.headers.get('ratelimit')),
        );
    });
});
