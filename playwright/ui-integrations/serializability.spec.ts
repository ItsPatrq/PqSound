import { test, expect } from '../shared/fixtures/test';

/**
 * Guards the two store invariants #156 was about: no live audio object may end
 * up in Redux state, and no reducer may write to the previous state. RTK's
 * `serializableCheck` and `immutableCheck` middleware log to the console rather
 * than throwing, so nothing else would notice a regression — this walks the
 * flows that touch the risky reducers and fails if either complained.
 */
const isStoreWarning = (text: string) =>
    text.includes('non-serializable') ||
    text.includes('serializableStateInvariant') ||
    text.includes('A state mutation was detected') ||
    text.includes('immutableStateInvariant');

test('keeps store state serializable and immutable across the main flows', async ({ dawPage, page }) => {
    const problems: string[] = [];
    page.on('console', (msg) => {
        if (isStoreWarning(msg.text())) {
            problems.push(msg.text());
        }
    });

    await dawPage.waitForAppReady();
    await dawPage.addTrack('Virtual instrument');
    await dawPage.openInstrumentPanel();
    await dawPage.selectInstrument('PqSynth');
    await dawPage.addPlugin('Equalizer');

    // Reorder / solo / mute / remove exercise the reducer cases that used to
    // write straight into the previous state's track objects.
    await dawPage.addTrack('AUX');
    await dawPage.moveTrackDown(0);
    await dawPage.moveTrackUp(1);
    await dawPage.toggleTrackSolo(0);
    await dawPage.toggleTrackMute(0);

    // This guard only covers the reducers the flow happens to reach, which is
    // easy to forget when adding one. Verified by injecting a live object into
    // `changeRecordState` — the spec passed, because nothing here had ever
    // triggered it. Record-arm and row-select close that gap; a plugin preset
    // change covers changePluginPreset, whose descriptor is the other place a
    // live object could reach the store.
    await dawPage.toggleTrackRecord(1);
    await dawPage.selectTrack(1);
    await dawPage.openPlugin('Equalizer');
    const eqSlider = dawPage.fxPanel.locator('input[type="range"]').first();
    await eqSlider.fill('0.25');

    await dawPage.removeTrackRow(0);

    await dawPage.loadDemo();
    await dawPage.play();
    await page.waitForTimeout(1500);
    await dawPage.stop();

    expect(problems).toEqual([]);
});
