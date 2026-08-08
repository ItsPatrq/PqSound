import { test, expect } from '../shared/fixtures/test';

/**
 * Guards the invariant #156 was about: no live audio object may end up in Redux
 * state. RTK's `serializableCheck` middleware logs to the console rather than
 * throwing, so nothing else would notice a regression — this walks the flows
 * that create engine objects and fails if the middleware complained.
 */
test('keeps store state serializable across the main flows', async ({ dawPage, page }) => {
    const problems: string[] = [];
    page.on('console', (msg) => {
        const text = msg.text();
        if (text.includes('non-serializable') || text.includes('serializableStateInvariant')) {
            problems.push(text);
        }
    });

    await dawPage.waitForAppReady();
    await dawPage.addTrack('Virtual instrument');
    await dawPage.openInstrumentPanel();
    await dawPage.selectInstrument('PqSynth');
    await dawPage.addPlugin('Equalizer');
    await dawPage.loadDemo();
    await dawPage.play();
    await page.waitForTimeout(1500);
    await dawPage.stop();

    expect(problems).toEqual([]);
});
