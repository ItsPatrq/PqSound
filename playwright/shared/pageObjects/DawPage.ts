import { expect, Locator, Page } from '@playwright/test';

/**
 * Page object for the PqSound DAW single-page app.
 *
 * Selectors lean on stable, human-visible anchors from the dark-re-skin Header
 * (the `.pq-brand` wordmark, the transport buttons' `title` attributes, the
 * `···` overflow menu's "Load demo" item) rather than on test ids, since the
 * app source carries none. The old Bootstrap navbar/`.controlBar` DOM is gone —
 * transport now lives in `.pq-header`.
 */
export class DawPage {
    readonly page: Page;
    readonly appRoot: Locator;
    readonly brand: Locator;
    readonly header: Locator;
    readonly menuButton: Locator;
    readonly loadDemoItem: Locator;
    readonly playButton: Locator;
    readonly recordButton: Locator;
    readonly stopButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.appRoot = page.locator('#app');
        // Brand wordmark: the `.pq-brand` wrapper joins its "Pq" + "Sound" spans → "PqSound".
        this.brand = page.locator('.pq-brand');
        this.header = page.locator('.pq-header');
        // Transport + menu buttons render as <button title="…">…</button>; anchor on the titles.
        this.menuButton = this.header.locator('button[title="Menu"]');
        // "Load demo" lives inside the `···` overflow menu (hidden until it's opened).
        this.loadDemoItem = this.page.getByText('Load demo', { exact: true });
        this.playButton = this.header.locator('button[title="Play"]');
        this.recordButton = this.header.locator('button[title="Record"]');
        this.stopButton = this.header.locator('button[title="Stop"]');
    }

    async goto(): Promise<void> {
        await this.page.goto('/');
    }

    /** Waits until the React app has mounted (placeholder replaced by real UI). */
    async waitForAppReady(): Promise<void> {
        await expect(this.brand).toBeVisible();
        await expect(this.header).toBeVisible();
        // The initial "Loading application..." placeholder must be gone.
        await expect(this.appRoot.locator('.application-placeholder')).toHaveCount(0);
    }

    /** Opens the `···` overflow menu that holds import/export/demo actions. */
    async openMenu(): Promise<void> {
        await this.menuButton.click();
        await expect(this.loadDemoItem).toBeVisible();
    }

    async loadDemo(): Promise<void> {
        await this.openMenu();
        await this.loadDemoItem.click();
    }

    async play(): Promise<void> {
        await this.playButton.click();
    }

    async stop(): Promise<void> {
        await this.stopButton.click();
    }

    /**
     * Returns the transport clock text (bar.beat + SMPTE), which the sequencer
     * updates as the playhead advances. Used to detect playback.
     */
    async playheadText(): Promise<string> {
        return (await this.header.innerText()).replace(/\s+/g, ' ').trim();
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
