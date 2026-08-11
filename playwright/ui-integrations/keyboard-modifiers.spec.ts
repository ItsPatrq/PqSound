import { test, expect } from '../shared/fixtures/test';

/**
 * #253: the computer-keyboard note handler skipped ctrl and alt but not meta,
 * and r/e/s/c are all bound to notes — so on macOS ⌘R, ⌘E, ⌘S and ⌘C fired a
 * note alongside the browser action. A pressed key renders with `.pressed`,
 * which makes this observable without reaching into the store.
 *
 * ⌘C is used deliberately: copy is the one of those four with no navigation,
 * download or reload side effect to disturb the test.
 */
test('does not play a note when a note key is pressed with a modifier', async ({ dawPage, page }) => {
    await dawPage.waitForAppReady();
    const pressedKeys = page.locator('.pressed');

    // Dispatched rather than typed: Chromium handles ⌘C itself and never
    // delivers it to the page, so page.keyboard.press('Meta+c') cannot tell a
    // guarded handler from an unguarded one. It passed against the unfixed
    // code, which is how I noticed.
    const sendWithModifier = (modifier: 'metaKey' | 'ctrlKey' | 'altKey') =>
        page.evaluate((flag) => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', [flag]: true, bubbles: true }));
        }, modifier);

    await sendWithModifier('metaKey');
    await expect(pressedKeys).toHaveCount(0);

    await sendWithModifier('ctrlKey');
    await expect(pressedKeys).toHaveCount(0);

    await sendWithModifier('altKey');
    await expect(pressedKeys).toHaveCount(0);

    // The bare key still plays, so the guard has not simply disabled the
    // computer keyboard.
    await page.keyboard.down('c');
    await expect(pressedKeys).not.toHaveCount(0);
    await page.keyboard.up('c');
    await expect(pressedKeys).toHaveCount(0);
});
