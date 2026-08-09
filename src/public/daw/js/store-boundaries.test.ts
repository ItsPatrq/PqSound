import * as fs from 'fs';
import * as path from 'path';

/**
 * The import-direction rules #156 established, checked against the source rather
 * than trusted to review:
 *
 *   - nothing under `engine/` imports the store module — the engine reads the
 *     snapshot `EngineStore` pushes, so the dependency stays one-way;
 *   - no component or container imports it either — they go through `connect`,
 *     so the UI depends on mapped props rather than on the store's layout.
 *
 * Both held when they were written, and both are the kind of thing a single
 * convenient import quietly undoes. `index.js` is the one legitimate importer:
 * it hands the store to `<Provider>`.
 */
const jsRoot = __dirname;

const IMPORTS_STORE = /(?:import|require)\s*\(?\s*['"][^'"]*\/store['"]|from\s+['"][^'"]*\/store['"]/;

// Comments are stripped before matching: EngineStore.ts documents the import it
// replaced by quoting it, and the first version of this test failed on that.
const stripComments = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

function sourceFilesUnder(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        return [];
    }
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return sourceFilesUnder(full);
        }
        return /\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [full] : [];
    });
}

const importersOfStoreIn = (dir: string) =>
    sourceFilesUnder(path.join(jsRoot, dir))
        .filter((file) => IMPORTS_STORE.test(stripComments(fs.readFileSync(file, 'utf8'))))
        .map((file) => path.relative(jsRoot, file));

describe('store import boundaries', () => {
    it('keeps the engine off the store module', () => {
        // engine/EngineStore.ts is the bridge itself and holds no import of it.
        expect(importersOfStoreIn('engine')).toEqual([]);
    });

    it('keeps components and containers off the store module', () => {
        // They receive state through `connect`; reaching for the singleton is how
        // ViewBar ended up reading `trackList[0]` on every animation frame.
        expect([...importersOfStoreIn('components'), ...importersOfStoreIn('containers')]).toEqual([]);
    });

    it('finds the files it is supposed to be scanning', () => {
        // Guards the test itself: a wrong path would make the assertions above
        // pass by looking at nothing.
        expect(sourceFilesUnder(path.join(jsRoot, 'engine')).length).toBeGreaterThan(5);
        expect(sourceFilesUnder(path.join(jsRoot, 'containers')).length).toBeGreaterThan(5);
        expect(IMPORTS_STORE.test("import store from './store';")).toBe(true);
        expect(IMPORTS_STORE.test("import { connectStore } from './engine/EngineStore';")).toBe(false);
        expect(IMPORTS_STORE.test(stripComments("/** used to `import Store from '../store'` directly */"))).toBe(false);
    });
});
