import { test, expect } from '../shared/fixtures/test';

/**
 * Region-level operations on the composition grid: copy/paste, erase, and
 * keeping regions attached to their track when it is reordered. These run
 * through compositionSlice's PASTE_REGION / REMOVE_REGION /
 * REGION_TRACK_INDEX_UP|DOWN, which had unit tests (#233) but no end-to-end
 * coverage.
 */
test.describe('Region operations', () => {
    test('erases a region with the Erase tool', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        await dawPage.selectTool('Draw');
        await dawPage.clickBar(0, 0);
        await expect(dawPage.regionsInRow(0)).not.toHaveCount(0);

        await dawPage.selectTool('Erase');
        await dawPage.regionsInRow(0).first().click();

        await expect(dawPage.regionsInRow(0)).toHaveCount(0);
        await expect(dawPage.brand).toBeVisible();
    });

    test('copies a region and pastes it further along the lane', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        await dawPage.selectTool('Draw');
        await dawPage.clickBar(0, 0);
        const drawnBits = await dawPage.regionsInRow(0).count();

        // Split is the copy/paste tool: click the region to copy, an empty bar
        // to paste.
        await dawPage.selectTool('Split');
        await dawPage.regionsInRow(0).first().click();
        await dawPage.clickBar(0, 8);

        // The paste is a second region of the same length, so the lane now has
        // twice as many region bits.
        await expect(dawPage.regionsInRow(0)).toHaveCount(drawnBits * 2);
        await expect(dawPage.brand).toBeVisible();
    });

    test('keeps a region with its track when the track is reordered', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        await dawPage.addTrack('Virtual instrument');

        // Region on the first lane only; the second stays empty.
        await dawPage.selectTool('Draw');
        await dawPage.clickBar(0, 0);
        const bits = await dawPage.regionsInRow(0).count();
        expect(bits).toBeGreaterThan(0);
        await expect(dawPage.regionsInRow(1)).toHaveCount(0);

        await dawPage.moveTrackDown(0);

        // The region moved lanes with its track rather than staying put.
        await expect(dawPage.regionsInRow(1)).toHaveCount(bits);
        await expect(dawPage.regionsInRow(0)).toHaveCount(0);
    });
});
