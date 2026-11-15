import * as fs from 'fs';
import * as path from 'path';
import { renderOffline } from './JunoEngine';
import { analyse, compare, mixToMono, Analysis, Comparison } from './reference/features';
import { readWav } from './reference/wav';
import { SAMPLE_RATE, TEST_PATCHES, TestPatch, blockToSample, lengthSamples } from './reference/testPatches';

/**
 * Does PqSound's Juno sound like the reference Juno-106 emulation?
 *
 * The reference renders come from Ultramaster KR-106, built and run by
 * `npm run juno:reference` (tools/juno-reference/render-reference.ts) into
 * .cache/juno-reference/. Both engines receive the same patch bytes and the
 * same sample-exact notes. Each pair is then compared on pitch, timbre,
 * loudness curve and spectrogram (see reference/features.ts for the metrics).
 *
 * Thresholds are absolute, but a threshold alone can pass vacuously if the
 * metric is too forgiving. So the suite also checks discrimination: each of
 * our renders must sit closer to its own reference than to the reference of
 * any other test patch.
 *
 * CI runs the renderer first and sets JUNO_REFERENCE_REQUIRED=1, so missing
 * references fail there. Locally, without them, the suite is skipped with a
 * note instead of failing `npm test` for everyone without a C++ toolchain.
 */

const referenceDir = path.join(__dirname, '../../../../../../.cache/juno-reference');
const required = process.env.JUNO_REFERENCE_REQUIRED === '1';
const available = TEST_PATCHES.every((t) => fs.existsSync(path.join(referenceDir, `${t.name}.wav`)));

export const THRESHOLDS = {
    pitchCents: 10,
    timbreDb: 3,
    loudnessDb: 3,
    loudnessP95Db: 6,
    spectrogramDb: 4.5,
};

function renderOurs(t: TestPatch): Float32Array {
    const events = t.notes.flatMap((n) => [
        { time: blockToSample(n.onBlock) / SAMPLE_RATE, note: n.note, on: true },
        { time: blockToSample(n.offBlock) / SAMPLE_RATE, note: n.note, on: false },
    ]);
    const [l, r] = renderOffline(t.patch, events, lengthSamples(t) / SAMPLE_RATE, SAMPLE_RATE);
    return mixToMono([l, r]);
}

function loadReference(t: TestPatch): Float32Array {
    const wav = readWav(fs.readFileSync(path.join(referenceDir, `${t.name}.wav`)));
    expect(wav.sampleRate).toBe(SAMPLE_RATE);
    return mixToMono(wav.channels).slice(0, lengthSamples(t));
}

const describeIfReference = available || required ? describe : describe.skip;
if (!available && !required) {
    console.log('JunoReference: no references in .cache/juno-reference; run `npm run juno:reference` to compare.');
}

describeIfReference('Juno engine vs. KR-106 reference', () => {
    const ours = new Map<string, Analysis>();
    const refs = new Map<string, Analysis>();
    const results = new Map<string, Comparison>();

    beforeAll(() => {
        if (!available) throw new Error('References missing: run `npm run juno:reference` first.');
        for (const t of TEST_PATCHES) {
            ours.set(t.name, analyse(renderOurs(t), SAMPLE_RATE));
            refs.set(t.name, analyse(loadReference(t), SAMPLE_RATE));
        }
        for (const t of TEST_PATCHES) {
            results.set(
                t.name,
                compare(ours.get(t.name)!, refs.get(t.name)!, { holdStart: t.hold[0], holdEnd: t.hold[1] }),
            );
        }
        const table = TEST_PATCHES.map((t) => {
            const r = results.get(t.name)!;
            return `${t.name.padEnd(12)} pitch ${r.pitchCents.toFixed(1).padStart(6)}c  timbre ${r.timbreDb.toFixed(2)}dB  loudness ${r.loudnessDb.toFixed(2)}/${r.loudnessP95Db.toFixed(2)}dB  spectrogram ${r.spectrogramDb.toFixed(2)}dB  lag ${r.lagFrames}`;
        });
        console.log(['Juno vs KR-106:', ...table].join('\n'));
    });

    describe.each(TEST_PATCHES.map((t) => [t.name, t] as const))('%s', (name, t) => {
        it('matches pitch', () => {
            const r = results.get(name)!;
            // Pitch is defined for a single held note of a periodic patch (not a chord, not noise).
            if (t.notes.length === 1 && (t.patch.saw || t.patch.pulse || t.patch.dcoSub)) {
                expect(Math.abs(r.pitchCents)).toBeLessThan(THRESHOLDS.pitchCents);
            }
        });
        it('matches timbre over the held note', () => {
            expect(results.get(name)!.timbreDb).toBeLessThan(THRESHOLDS.timbreDb);
        });
        it('matches the loudness curve', () => {
            expect(results.get(name)!.loudnessDb).toBeLessThan(THRESHOLDS.loudnessDb);
            expect(results.get(name)!.loudnessP95Db).toBeLessThan(THRESHOLDS.loudnessP95Db);
        });
        it('matches the spectrogram', () => {
            expect(results.get(name)!.spectrogramDb).toBeLessThan(THRESHOLDS.spectrogramDb);
        });
    });

    it('is closer to its own reference than to any other patch (the metric discriminates)', () => {
        const confusions: string[] = [];
        for (const t of TEST_PATCHES) {
            const own = results.get(t.name)!.spectrogramDb;
            for (const other of TEST_PATCHES) {
                if (other.name === t.name) continue;
                const d = compare(ours.get(t.name)!, refs.get(other.name)!, {
                    holdStart: other.hold[0],
                    holdEnd: other.hold[1],
                }).spectrogramDb;
                if (d <= own)
                    confusions.push(
                        `${t.name} is as close to ${other.name} (${d.toFixed(2)}) as to itself (${own.toFixed(2)})`,
                    );
            }
        }
        expect(confusions).toEqual([]);
    });
});
