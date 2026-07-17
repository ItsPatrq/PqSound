import { test as base } from '@playwright/test';
import { DawPage } from '../pageObjects/DawPage';

/**
 * Shared test fixtures. Extends the base Playwright test with a ready-to-use
 * `dawPage` page object so specs read declaratively.
 */
type DawFixtures = {
    dawPage: DawPage;
};

export const test = base.extend<DawFixtures>({
    dawPage: async ({ page }, use) => {
        const dawPage = new DawPage(page);
        await dawPage.goto();
        await use(dawPage);
    },
});

export { expect } from '@playwright/test';
