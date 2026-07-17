import { test, expect } from '../shared/fixtures/test';

test.describe('Plays the demo composition', () => {
    test.beforeEach(async ({ dawPage }) => {
        await dawPage.waitForAppReady();
    });

    test('loads the demo and advances the playhead on play', async ({ dawPage }) => {
        await dawPage.loadDemo();
        // Give the demo samples a moment to begin loading from the server.
        await dawPage.page.waitForTimeout(2_000);

        const before = await dawPage.playheadText();
        await dawPage.play();

        // Playback advances the sequencer, which updates the transport clock.
        await dawPage.waitForPlayheadToAdvance(before);
    });

    test('stop resets the playhead to zero', async ({ dawPage }) => {
        await dawPage.loadDemo();
        await dawPage.page.waitForTimeout(2_000);

        const initial = await dawPage.playheadText();
        await dawPage.play();
        await dawPage.waitForPlayheadToAdvance(initial);

        await dawPage.stop();
        // After stop the sequencer resets currentTime to 0, so the clock returns
        // to its initial (all-zero) reading.
        await expect
            .poll(async () => dawPage.playheadText(), {
                message: 'expected playhead to reset to its initial value after stop',
            })
            .toBe(initial);
    });
});
