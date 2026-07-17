import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for PqSound UI-integration tests.
 *
 * The DAW is a single Express app that serves both the client bundle and the
 * instrument sample files, so one web server backs every test. `npm run
 * start:local` boots it with webpack-dev-middleware on port 3000.
 *
 * Chromium is launched with autoplay allowed so the Web Audio AudioContext can
 * start without a user gesture — required for the sequencer to advance the
 * playhead during the "plays demo" test.
 */
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './ui-integrations',
    // Keep artifacts inside playwright/ (git-ignored there).
    outputDir: './test-results',
    // The app boots (webpack dev build) and streams ~85 MB of samples; be patient.
    timeout: 120_000,
    expect: { timeout: 30_000 },
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [['list'], ['html', { outputFolder: 'report', open: 'never' }]],
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'],
                },
            },
        },
    ],
    webServer: {
        command: 'npm run start:local',
        url: BASE_URL,
        cwd: '..',
        reuseExistingServer: !process.env.CI,
        // First boot compiles the client bundle; allow generous startup time.
        timeout: 180_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
