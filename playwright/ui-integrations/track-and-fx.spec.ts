import { test, expect } from '../shared/fixtures/test';

/**
 * Covers the flows the engine/store decoupling (#156) rewired: adding a track,
 * switching a track's instrument, and the plugin chain. Each of these now goes
 * through an AudioEngine registry (track graphs, instruments, plugin chains)
 * with only descriptors left in the store, so a mistake there shows up as a
 * dead or crashing UI rather than a failing unit test — #227 shipped exactly
 * that kind of first-render crash past a green unit suite.
 */
test.describe('Tracks', () => {
    test('adds a virtual-instrument track', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        const before = await dawPage.trackCount();

        await dawPage.addTrack('Virtual instrument');

        await expect.poll(() => dawPage.trackCount()).toBe(before + 1);
        // The app must still be alive: a broken registry took the whole tree down.
        await expect(dawPage.brand).toBeVisible();
    });

    test('adds an aux track', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        const before = await dawPage.trackCount();

        await dawPage.addTrack('AUX');

        await expect.poll(() => dawPage.trackCount()).toBe(before + 1);
        await expect(dawPage.brand).toBeVisible();
    });
});

test.describe('Instrument editor', () => {
    test('opens for the selected channel', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await dawPage.openInstrumentPanel();

        await expect(dawPage.instrumentPanel).toBeVisible();
        // The default track is the MultiOsc synth built by INIT_INSTRUMENT_CONTEXT.
        expect(await dawPage.selectedInstrumentName()).not.toBe('');
    });

    test('switches the track instrument', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        await dawPage.openInstrumentPanel();

        await dawPage.selectInstrument('PqSynth');

        await expect.poll(() => dawPage.selectedInstrumentName()).toBe('PqSynth');
        // The editor body swapped with it, and nothing crashed.
        await expect(dawPage.instrumentPanel).toBeVisible();
        await expect(dawPage.brand).toBeVisible();
    });
});

test.describe('Plugin chain', () => {
    test('adds a plugin, opens its editor and removes it', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await dawPage.addPlugin('Equalizer');
        await expect(dawPage.pluginRow('Equalizer')).toBeVisible();

        await dawPage.openPlugin('Equalizer');
        await expect(dawPage.fxPanel).toContainText('Equalizer');

        await dawPage.removePlugin('Equalizer');
        await expect(dawPage.pluginRow('Equalizer')).toHaveCount(0);
        await expect(dawPage.brand).toBeVisible();
    });

    test('keeps a second plugin working after the first is removed', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await dawPage.addPlugin('Equalizer');
        await dawPage.addPlugin('Compressor');
        await expect(dawPage.pluginRows).toHaveCount(2);

        // Removing by plugin index renumbers the rest inside the engine's live
        // array — the survivor must still open its editor.
        await dawPage.removePlugin('Equalizer');
        await expect(dawPage.pluginRows).toHaveCount(1);

        await dawPage.openPlugin('Compressor');
        await expect(dawPage.fxPanel).toContainText('Compressor');
    });

    test('changes a plugin preset from the FX editor', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        await dawPage.addPlugin('Equalizer');
        await dawPage.openPlugin('Equalizer');

        const firstSlider = dawPage.fxPanel.locator('input[type="range"]').first();
        await expect(firstSlider).toBeVisible();
        // This used to use max/2, which for the Equalizer's 0..2 lowFilterGain
        // slider is exactly its 1.0 default — so the assertion below held
        // whether or not the fill did anything. Assert the target differs from
        // what is already there.
        const initial = await firstSlider.inputValue();
        const target = '0.25';
        expect(target).not.toBe(initial);
        await firstSlider.fill(target);

        // The descriptor in the store is what the editor re-renders from, so the
        // new value sticking proves the round-trip through the thunk worked.
        await expect.poll(async () => firstSlider.inputValue()).toBe(target);
        await expect(dawPage.brand).toBeVisible();
    });
});
