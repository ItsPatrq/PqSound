import { test, expect } from '../shared/fixtures/test';

/**
 * The import half of the export/import round trip. #254 covered export and left
 * this side untested, which matters twice over: it is the app's only way back
 * in from a file, and it is the one path that reaches plugin and instrument
 * presets the UI cannot produce (see #264).
 *
 * The file input inside the drop zone is driven directly rather than by
 * simulating a drag, so the assertion is about the app's own load path rather
 * than about react-dropzone's drag handling.
 */
test('loads a composition back from an exported file', async ({ dawPage, page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (error) => crashes.push(error.message));

    await dawPage.waitForAppReady();
    await dawPage.loadDemo();

    // Take the demo out through the real export path first, so the fixture is
    // exactly what a user would be importing.
    await dawPage.openMenu();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByText('Export JSON…', { exact: true }).click(),
    ]);
    // Saved under its real name: download.path() is an extensionless temp file,
    // which the dropzone's .json filter correctly refuses.
    const exported = test.info().outputPath(download.suggestedFilename());
    await download.saveAs(exported);

    const tracksBefore = await dawPage.trackCount();
    expect(tracksBefore).toBeGreaterThan(1);

    // Reload to a clean slate, then import the file that was just written.
    await page.reload();
    await dawPage.waitForAppReady();

    await dawPage.openMenu();
    await page.getByText('Import…', { exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles(exported);

    // The composition is back: same track count, no crash on the way in.
    await expect.poll(() => dawPage.trackCount()).toBe(tracksBefore);
    expect(crashes).toEqual([]);
});

/**
 * Track count alone does not prove much: the import path rebuilds every plugin
 * from scratch and replays the saved preset into it, so a regression there is
 * invisible to a count.
 *
 * Deliberately NOT covered here: audio routing. #263's bug left a track wired
 * to context.destination instead of its aux while the store descriptor stayed
 * correct, so no DOM assertion can see it — checking that needs the engine's
 * graph exposed to the page, which nothing currently does.
 */
test('keeps plugin presets across a round trip', async ({ dawPage, page }) => {
    const crashes: string[] = [];
    page.on('pageerror', (error) => crashes.push(error.message));

    await dawPage.waitForAppReady();

    await dawPage.addTrack('AUX');
    const tracksBefore = await dawPage.trackCount();

    await dawPage.addPlugin('Equalizer');
    await dawPage.openPlugin('Equalizer');
    const slider = dawPage.fxPanel.locator('input[type="range"]').first();
    // Must differ from the preset default, or the assertion passes without the
    // value ever having been carried anywhere. lowFilterGain defaults to 1.0 on
    // a 0..2 slider, so the midpoint — the obvious choice — is exactly the
    // value that proves nothing.
    const initial = await slider.inputValue();
    const target = '0.25';
    expect(target).not.toBe(initial);
    await slider.fill(target);
    await expect.poll(async () => slider.inputValue()).toBe(target);

    await dawPage.openMenu();
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByText('Export JSON…', { exact: true }).click(),
    ]);
    const exported = test.info().outputPath(download.suggestedFilename());
    await download.saveAs(exported);

    await page.reload();
    await dawPage.waitForAppReady();
    await dawPage.openMenu();
    await page.getByText('Import…', { exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles(exported);

    await expect.poll(() => dawPage.trackCount()).toBe(tracksBefore);

    // The plugin is back on the chain with the edited value, not its default —
    // which means the descriptor survived export, import and the rebuild that
    // constructs a fresh plugin and replays the preset into it.
    await dawPage.openPlugin('Equalizer');
    const restored = dawPage.fxPanel.locator('input[type="range"]').first();
    await expect.poll(async () => restored.inputValue()).toBe(target);

    expect(crashes).toEqual([]);
});

test('offers the file picker a json filter', async ({ dawPage, page }) => {
    await dawPage.waitForAppReady();
    await dawPage.openMenu();
    await page.getByText('Import…', { exact: true }).click();

    // `accept=".json"` (a string, where react-dropzone wants a MIME map) was
    // silently dropped, so the picker rendered accept="" and offered every file
    // on disk. Measured identically on the installed version and on v20.
    await expect(page.locator('input[type="file"]')).toHaveAttribute('accept', /json/);
});
