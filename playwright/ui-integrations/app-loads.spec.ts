import { test, expect } from '../shared/fixtures/test';

test.describe('Application loads', () => {
    test('mounts the React app and renders the shell', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await expect(dawPage.brand).toHaveText('PqSound');
        await expect(dawPage.appRoot).toBeVisible();
    });

    test('shows the transport controls', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        // The re-skin Header has a single play/pause toggle (title stays "Play"),
        // plus record and stop — there is no longer a separate Pause button.
        await expect(dawPage.recordButton).toBeVisible();
        await expect(dawPage.playButton).toBeVisible();
        await expect(dawPage.stopButton).toBeVisible();
    });

    test('exposes the "Load demo" menu action', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        // "Load demo" is tucked into the `···` overflow menu now.
        await dawPage.openMenu();
        await expect(dawPage.loadDemoItem).toBeVisible();
    });
});
