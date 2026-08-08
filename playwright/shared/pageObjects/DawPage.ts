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
    readonly tracksTitle: Locator;
    readonly addTrackButton: Locator;
    readonly trackRows: Locator;
    readonly editInstrumentButton: Locator;
    readonly instrumentPanel: Locator;
    readonly instrumentDropdownToggle: Locator;
    readonly addPluginToggle: Locator;
    readonly pluginRows: Locator;
    readonly fxPanel: Locator;

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

        // Tracks panel: header reads "TRACKS · N"; "+" opens the add-track modal.
        this.tracksTitle = page.locator('.pq-tracks-title');
        this.addTrackButton = page.locator('button[title="Add track"]');
        this.trackRows = page.locator('.trackListContentList > *');

        // Channel panel -> instrument editor column.
        this.editInstrumentButton = page.locator('button[title="Edit instrument"]');
        this.instrumentPanel = page.locator('.pq-instrument-col');
        this.instrumentDropdownToggle = this.instrumentPanel.locator('.pq-inst-select .pq-dropdown-toggle');

        // Channel panel -> plugin chain -> FX editor column.
        this.addPluginToggle = page.locator('.addNewPluginButton .pq-dropdown-toggle');
        this.pluginRows = page.locator('.pluginRow');
        this.fxPanel = page.locator('.pq-fx-col');
    }

    /** Track count as shown in the tracks-panel header ("TRACKS · N"). */
    async trackCount(): Promise<number> {
        const text = (await this.tracksTitle.innerText()).trim();
        return Number(text.replace(/[^0-9]/g, ''));
    }

    /** Opens the add-track modal and picks a track type. */
    async addTrack(type: 'Virtual instrument' | 'AUX'): Promise<void> {
        await this.addTrackButton.click();
        const option = this.page.getByText(type, { exact: true });
        await expect(option).toBeVisible();
        await option.click();
    }

    /** Opens the instrument editor column for the selected channel. */
    async openInstrumentPanel(): Promise<void> {
        await this.editInstrumentButton.click();
        await expect(this.instrumentPanel).toBeVisible();
    }

    /** Current instrument name, as shown on the editor's dropdown toggle. */
    async selectedInstrumentName(): Promise<string> {
        return (await this.instrumentDropdownToggle.innerText()).trim();
    }

    async selectInstrument(name: string): Promise<void> {
        await this.instrumentDropdownToggle.click();
        const item = this.instrumentPanel.getByRole('menuitem', { name, exact: true });
        await expect(item).toBeVisible();
        await item.click();
    }

    /** Adds a plugin to the selected channel's chain via the "Add new plugin" dropdown. */
    async addPlugin(name: string): Promise<void> {
        await this.addPluginToggle.click();
        const item = this.page.getByRole('menuitem', { name, exact: true });
        await expect(item).toBeVisible();
        await item.click();
    }

    pluginRow(name: string): Locator {
        return this.page.locator('.pluginRow', { hasText: name });
    }

    /**
     * Ensures the FX editor is showing `name`. Adding a plugin already opens its
     * editor, and a chain-row click is a toggle, so clicking unconditionally
     * would close it.
     */
    async openPlugin(name: string): Promise<void> {
        if (!(await this.fxPanel.isVisible()) || !(await this.fxPanel.innerText()).includes(name)) {
            await this.pluginRow(name).locator('.pluginRowName').click();
        }
        await expect(this.fxPanel).toBeVisible();
        await expect(this.fxPanel).toContainText(name);
    }

    async removePlugin(name: string): Promise<void> {
        await this.pluginRow(name).locator('.pluginRowRemove').click();
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
