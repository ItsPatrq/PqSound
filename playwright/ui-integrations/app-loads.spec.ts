import { test, expect } from '../shared/fixtures/test';

test.describe('Application loads', () => {
    test('mounts the React app and renders the shell', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await expect(dawPage.brand).toHaveText('PqSound');
        await expect(dawPage.appRoot).toBeVisible();
    });

    test('shows the transport controls', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await expect(dawPage.playButton).toBeVisible();
        await expect(dawPage.pauseButton).toBeVisible();
        await expect(dawPage.stopButton).toBeVisible();
    });

    test('exposes the "Load demo" menu action', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        await expect(dawPage.loadDemoItem).toBeVisible();
    });
});
