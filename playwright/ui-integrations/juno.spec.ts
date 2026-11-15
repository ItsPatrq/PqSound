import { test, expect } from '../shared/fixtures/test';

/**
 * The Juno is the only instrument that runs in an AudioWorklet, so it is the
 * only one that depends on a second bundle (/assets/juno-worklet.js) being
 * served and loadable in the worklet scope. Unit tests mock all of that; this
 * checks a key press produces actual signal in a real browser.
 *
 * Every AudioWorkletNode the page builds is tapped with an AnalyserNode, so
 * the spec can read the Juno's output level without touching app internals.
 */
test.describe('Juno-106 instrument', () => {
    test.beforeEach(async ({ dawPage }) => {
        await dawPage.page.addInitScript(() => {
            const Original = window.AudioWorkletNode;
            const probes: AnalyserNode[] = [];
            (window as any).__junoProbes = probes;
            (window as any).__junoLevel = () => {
                let peak = 0;
                const buf = new Float32Array(2048);
                for (const a of probes) {
                    a.getFloatTimeDomainData(buf);
                    for (const v of buf) peak = Math.max(peak, Math.abs(v));
                }
                return peak;
            };
            window.AudioWorkletNode = class extends Original {
                constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions) {
                    super(context, name, options);
                    const analyser = context.createAnalyser();
                    analyser.fftSize = 2048;
                    this.connect(analyser);
                    probes.push(analyser);
                }
            } as typeof AudioWorkletNode;
        });
        // The fixture has already loaded the app; init scripts apply from the next navigation.
        await dawPage.page.reload();
    });

    test('loads its worklet and sounds when a key is played', async ({ dawPage }) => {
        const page = dawPage.page;
        const errors: string[] = [];
        page.on('console', (m) => {
            if (m.type() === 'error') errors.push(m.text());
        });

        await dawPage.waitForAppReady();
        await dawPage.openInstrumentPanel();
        await dawPage.selectInstrument('Juno-106');
        await expect.poll(() => dawPage.selectedInstrumentName()).toBe('Juno-106');
        await expect(dawPage.instrumentPanel.getByText('CHORUS')).toBeVisible();

        await expect
            .poll(() => page.evaluate(() => (window as any).__junoProbes.length), {
                message: 'the Juno AudioWorkletNode was never built (worklet module failed to load?)',
            })
            .toBeGreaterThan(0);

        // Click outside the editor first so the key press reaches the keyboard handler.
        await dawPage.brand.click();
        await page.keyboard.down('c');
        await expect
            .poll(() => page.evaluate(() => (window as any).__junoLevel()), {
                message: 'no signal from the Juno while a key is held',
                timeout: 10_000,
            })
            .toBeGreaterThan(0.001);
        await page.keyboard.up('c');

        expect(errors.filter((e) => e.includes('Juno'))).toEqual([]);
    });
});
