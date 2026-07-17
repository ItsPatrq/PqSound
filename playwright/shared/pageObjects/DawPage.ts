import { expect, Locator, Page } from '@playwright/test';

/**
 * Page object for the PqSound DAW single-page app.
 *
 * Selectors lean on stable, human-visible anchors (the navbar brand, the
 * "Load demo" menu item, the transport buttons' bootstrap glyphicons) rather
 * than on test ids, since the app source carries none.
 */
export class DawPage {
    readonly page: Page;
    readonly appRoot: Locator;
    readonly brand: Locator;
    readonly loadDemoItem: Locator;
    readonly controlBar: Locator;
    readonly playButton: Locator;
    readonly pauseButton: Locator;
    readonly stopButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.appRoot = page.locator('#app');
        this.brand = page.locator('.navbar-brand');
        this.loadDemoItem = page.getByText('Load demo', { exact: true });
        this.controlBar = page.locator('.controlBar');
        // Transport buttons render as <button><span class="glyphicon glyphicon-*"></span></button>.
        this.playButton = page.locator('.controlButtons button', { has: page.locator('.glyphicon-play') });
        this.pauseButton = page.locator('.controlButtons button', { has: page.locator('.glyphicon-pause') });
        this.stopButton = page.locator('.controlButtons button', { has: page.locator('.glyphicon-stop') });
    }

    async goto(): Promise<void> {
        await this.page.goto('/');
    }

    /** Waits until the React app has mounted (placeholder replaced by real UI). */
    async waitForAppReady(): Promise<void> {
        await expect(this.brand).toBeVisible();
        await expect(this.controlBar).toBeVisible();
        // The initial "Loading application..." placeholder must be gone.
        await expect(this.appRoot.locator('.application-placeholder')).toHaveCount(0);
    }

    async loadDemo(): Promise<void> {
        await this.loadDemoItem.click();
    }

    async play(): Promise<void> {
        await this.playButton.click();
    }

    async stop(): Promise<void> {
        await this.stopButton.click();
    }

    /**
     * Returns the transport clock text (bar/beat/tick + SMPTE), which the
     * sequencer updates as the playhead advances. Used to detect playback.
     */
    async playheadText(): Promise<string> {
        return (await this.controlBar.innerText()).replace(/\s+/g, ' ').trim();
    }

    /** Polls until the playhead clock text changes from `previous`, proving playback advanced. */
    async waitForPlayheadToAdvance(previous: string, timeout = 30_000): Promise<void> {
        await expect
            .poll(async () => this.playheadText(), {
                message: 'expected transport playhead to advance after pressing play',
                timeout,
            })
            .not.toBe(previous);
    }
}
