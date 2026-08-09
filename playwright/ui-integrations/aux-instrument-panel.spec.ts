import { test, expect } from '../shared/fixtures/test';

/**
 * #252 asked whether the missing null-instrument guard is reachable from the
 * UI. It is, but not through the path the reviews guessed at: the instrument
 * picker is gated on trackType, so it never renders for an aux track — while
 * InstrumentPanel stays mounted on `show` and re-reads the *selected* track,
 * with no type guard at all. Selecting an aux track with the editor open is
 * therefore a render-time crash, not a thunk-time one.
 */
test('keeps working when an aux track is selected with the instrument editor open', async ({ dawPage, page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (error) => crashes.push(error.message));

    await dawPage.waitForAppReady();
    await dawPage.addTrack('AUX');

    // Open the editor on the default virtual-instrument track (the default
    // selection), then move the selection to the aux track while it is open.
    await dawPage.openInstrumentPanel();
    await dawPage.trackRows.last().click();

    expect(crashes).toEqual([]);
    // The app is still alive and the track list still renders.
    await expect(dawPage.trackRows.first()).toBeVisible();
});
