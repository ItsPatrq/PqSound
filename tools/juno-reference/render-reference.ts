/**
 * Renders the reference side of JunoReference.test.ts.
 *
 * The reference is Ultramaster KR-106 (https://github.com/kayrockscreenprinting/ultramaster_kr106),
 * an open-source Juno-106 emulation built by reverse-engineering the hardware.
 * It is GPL-3.0, so none of its code is part of PqSound: this script fetches it
 * into .cache/ (git-ignored), builds its header-only command-line renderer, and
 * feeds it MIDI files that carry each test patch as a standard Juno-106
 * All Parameter Report SysEx followed by the test notes. PqSound's engine is
 * an independent implementation compared against that output.
 *
 *   npm run juno:reference            # render every patch
 *   npm run juno:reference -- pluck   # render only the named patches
 *
 * Output: .cache/juno-reference/<patch>.wav (mono, 16-bit, 44.1 kHz), plus
 * manifest.json recording the KR-106 commit the references came from.
 */
import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { toAprSysEx } from '../../src/public/daw/js/instruments/juno/JunoPatch';
import { writeMidi } from '../../src/public/daw/js/instruments/juno/reference/midi';
import { readWav, writeWav } from '../../src/public/daw/js/instruments/juno/reference/wav';
import { mixToMono } from '../../src/public/daw/js/instruments/juno/reference/features';
import {
    SAMPLE_RATE,
    TEST_PATCHES,
    blockToSample,
    lengthSamples,
} from '../../src/public/daw/js/instruments/juno/reference/testPatches';

export const KR106_REPO = 'https://github.com/kayrockscreenprinting/ultramaster_kr106';
export const KR106_TAG = 'v2.5.13';

const root = path.join(__dirname, '../..');
const cache = path.join(root, '.cache');
const kr106Dir = path.join(cache, 'kr106');
const outDir = path.join(cache, 'juno-reference');
const binary = path.join(kr106Dir, 'render_midi');

function sh(cmd: string, args: string[], cwd = root) {
    execFileSync(cmd, args, { cwd, stdio: ['ignore', 'inherit', 'inherit'] });
}

function ensureRenderer(): string {
    if (!fs.existsSync(path.join(kr106Dir, 'Source/DSP/KR106_DSP.h'))) {
        fs.mkdirSync(cache, { recursive: true });
        fs.rmSync(kr106Dir, { recursive: true, force: true });
        // No --recursive: the renderer needs only Source/DSP, not JUCE.
        sh('git', ['clone', '--depth', '1', '--branch', KR106_TAG, KR106_REPO, kr106Dir]);
    }
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: kr106Dir }).toString().trim();
    if (!fs.existsSync(binary)) {
        const cxx = process.env.CXX || 'c++';
        sh(cxx, ['-std=c++17', '-O2', '-o', binary, path.join(kr106Dir, 'tools/render-midi/render_midi.cpp')]);
    }
    return commit;
}

function main() {
    const only = process.argv.slice(2);
    const patches = only.length ? TEST_PATCHES.filter((t) => only.includes(t.name)) : TEST_PATCHES;
    if (!patches.length) throw new Error(`No test patch named ${only.join(', ')}`);

    const commit = ensureRenderer();
    fs.mkdirSync(path.join(outDir, 'midi'), { recursive: true });

    for (const t of patches) {
        const events = [
            { tick: 0, bytes: toAprSysEx(t.patch) },
            ...t.notes.flatMap((n) => [
                { tick: blockToSample(n.onBlock), bytes: [0x90, n.note, 100] },
                { tick: blockToSample(n.offBlock), bytes: [0x80, n.note, 0] },
            ]),
        ];
        const midiPath = path.join(outDir, 'midi', `${t.name}.mid`);
        fs.writeFileSync(midiPath, writeMidi(events));
        const rawPath = path.join(outDir, 'midi', `${t.name}.raw.wav`);
        sh(binary, [midiPath, rawPath, String(SAMPLE_RATE)]);

        const rendered = readWav(fs.readFileSync(rawPath));
        if (rendered.sampleRate !== SAMPLE_RATE) throw new Error(`${t.name}: rendered at ${rendered.sampleRate} Hz`);
        const mono = mixToMono(rendered.channels).slice(0, lengthSamples(t));
        fs.writeFileSync(path.join(outDir, `${t.name}.wav`), writeWav({ sampleRate: SAMPLE_RATE, channels: [mono] }));
        console.log(`rendered ${t.name}`);
    }

    fs.writeFileSync(
        path.join(outDir, 'manifest.json'),
        JSON.stringify({ renderer: KR106_REPO, tag: KR106_TAG, commit, patches: patches.map((p) => p.name) }, null, 2) +
            '\n',
    );
}

main();
