import { test, expect } from '../shared/fixtures/test';

/**
 * Export -> import round trip, exercised through the browser rather than by
 * inspecting the encoded string.
 *
 * The distinction matters: `export()` percent-encodes the already-encoded
 * payload into a `data:` URL, and the browser percent-decodes that URL when it
 * writes the file. Reading the payload string on its own therefore looks
 * double-encoded while the file on disk is single-encoded — which is exactly
 * the format `loadComposition` (one `decodeURIComponent`) and `constants/Demo.js`
 * both use. Only a download can tell the two readings apart.
 */
test('exports a composition file that it can read back', async ({ dawPage, page }) => {
    await dawPage.waitForAppReady();
    await dawPage.loadDemo();

    await dawPage.openMenu();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByText('Export JSON…', { exact: true }).click(),
    ]);

    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    const fileBody = Buffer.concat(chunks).toString('utf8');

    // What the app itself does on import.
    const parsed = JSON.parse(decodeURIComponent(fileBody));

    expect(parsed).toHaveProperty('tracks.trackList');
    expect(parsed).toHaveProperty('composition.regionList');
    expect(parsed).toHaveProperty('control');
    expect(parsed.tracks.trackList.length).toBeGreaterThan(1);
    // MIDI device selection is session hardware state and must not be exported.
    expect(parsed.control.midi).toBeUndefined();
});
