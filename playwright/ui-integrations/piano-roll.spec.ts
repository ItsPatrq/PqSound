import { test, expect } from '../shared/fixtures/test';

/**
 * Covers the composition-grid → piano-roll flow: drawing a region, opening it,
 * and adding/removing notes. That path runs through compositionReducer's
 * ADD_REGION / ADD_NOTE / REMOVE_NOTE, which #233 rewrote from
 * whole-composition deep copies to targeted ones — and which had no end-to-end
 * coverage at all.
 */
test.describe('Piano roll', () => {
    test('draws a region, opens it and adds a note', async ({ dawPage }) => {
        await dawPage.waitForAppReady();

        // Draw is the default tool; clicking an empty bar creates a region.
        await dawPage.selectTool('Draw');
        await dawPage.clickBar(0, 0);
        await expect(dawPage.regionsInRow(0).first()).toBeVisible();

        // The pointer tool opens a region in the piano roll.
        await dawPage.selectTool('Pointer');
        await dawPage.regionsInRow(0).first().click();
        await expect(dawPage.pianoRoll()).toBeVisible();

        await dawPage.selectTool('Draw');
        await dawPage.clickPianoRollRow(40, 0);

        await expect(dawPage.pianoRollNotes()).toHaveCount(1);
    });

    test('erases a note without disturbing the others', async ({ dawPage }) => {
        await dawPage.waitForAppReady();
        await dawPage.selectTool('Draw');
        await dawPage.clickBar(0, 0);
        await dawPage.selectTool('Pointer');
        await dawPage.regionsInRow(0).first().click();

        await dawPage.selectTool('Draw');
        await dawPage.clickPianoRollRow(40, 0);
        await dawPage.clickPianoRollRow(41, 4);
        await expect(dawPage.pianoRollNotes()).toHaveCount(2);

        await dawPage.selectTool('Erase');
        await dawPage.clickPianoRollRow(40, 0);

        await expect(dawPage.pianoRollNotes()).toHaveCount(1);
        await expect(dawPage.brand).toBeVisible();
    });
});
