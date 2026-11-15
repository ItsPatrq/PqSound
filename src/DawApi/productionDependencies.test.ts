import * as fs from 'fs';
import * as path from 'path';

/**
 * The Docker image runs `npm prune --omit=dev` before `npm start`, so anything
 * the server loads at runtime must be a production dependency. Two regressions
 * of this kind shipped unnoticed, because every local and CI run has
 * devDependencies installed:
 *
 *   - DawApiServer imported `publicPath` from webpackCfg/defaults, which loads
 *     mini-css-extract-plugin and html-webpack-plugin at module scope.
 *   - `npm start` type-checked through ts-node, so even `import type` from
 *     webpack failed with TS2307 once webpack's types were pruned.
 *
 * This walks the static import graph from src/start.ts, the way Node will at
 * boot, and fails on any devDependency. Lazy `require()` calls inside function
 * bodies are skipped: the dev-only webpack middleware is loaded that way on
 * purpose, behind `NODE_ENV=local`.
 */
const root = path.join(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const devDependencies = new Set(Object.keys(pkg.devDependencies));
const dependencies = new Set(Object.keys(pkg.dependencies));

// Module-scope imports only: `import ... from 'x'`, `import x = require('x')`,
// `export ... from 'x'`, and top-level `const x = require('x')`. Type-only
// imports are erased under transpile-only, so they never reach Node.
const importPattern =
    /^(?:(?:import|export)\s+(?!type\b)[\w$*\s{},]+?\s+from\s*|import\s+\w+\s*=\s*require\(|(?:const|let|var)\s+[\w$\s{},:]+=\s*require(?:\.resolve)?\(|import\s*)['"]([^'"]+)['"]/gm;

const packageName = (specifier: string) =>
    specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];

const resolveLocal = (from: string, specifier: string): string | undefined => {
    const base = path.resolve(path.dirname(from), specifier);
    return ['', '.ts', '.js', '/index.ts', '/index.js']
        .map((ext) => base + ext)
        .find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
};

function walk(entries: string[]) {
    const seen = new Set<string>();
    const external = new Map<string, string>();
    const queue = [...entries];
    while (queue.length) {
        const file = queue.pop()!;
        if (seen.has(file)) continue;
        seen.add(file);
        const source = fs.readFileSync(file, 'utf8');
        for (const [, specifier] of source.matchAll(importPattern)) {
            if (specifier.startsWith('.')) {
                const resolved = resolveLocal(file, specifier);
                if (!resolved) throw new Error(`${path.relative(root, file)}: cannot resolve '${specifier}'`);
                queue.push(resolved);
            } else if (!specifier.startsWith('node:')) {
                external.set(packageName(specifier), path.relative(root, file));
            }
        }
    }
    return { files: [...seen].map((f) => path.relative(root, f)), external };
}

// `node -r <module>` preloads from the start script run before src/start.ts.
// Local ones are walked like any source file; package ones are checked as-is.
const preloads = [...pkg.scripts.start.matchAll(/(?:-r|--require)\s+(\S+)/g)].map(([, m]) => m);
const localPreloads = preloads.filter((m) => m.startsWith('.')).map((m) => path.join(root, m));

describe('production server dependencies', () => {
    const { files, external } = walk([path.join(root, 'src/start.ts'), ...localPreloads]);
    preloads.filter((m) => !m.startsWith('.')).forEach((m) => external.set(packageName(m), 'package.json "start"'));

    it('reaches the server modules (guards against the walk silently finding nothing)', () => {
        expect(files).toEqual(expect.arrayContaining(['src/DawApi/DawApiServer.ts', 'src/webpackCfg/publicPath.ts']));
        expect(external.has('express')).toBe(true);
        expect(external.has('ts-node')).toBe(true);
        // TS7 ships no compiler API, so ts-node gets TS6's through this preload.
        expect(files).toContain('utils/typescript6.js');
        expect(external.has('@typescript/typescript6')).toBe(true);
    });

    it('loads no devDependency at boot', () => {
        const offenders = [...external]
            .filter(([name]) => devDependencies.has(name))
            .map(([name, file]) => `${name} (from ${file})`);
        expect(offenders).toEqual([]);
    });

    it('loads only declared packages or Node builtins', () => {
        const builtins = new Set(require('module').builtinModules);
        const undeclared = [...external.keys()].filter((name) => !dependencies.has(name) && !builtins.has(name));
        expect(undeclared).toEqual([]);
    });

    it('starts through transpile-only ts-node, so pruned type packages cannot fail the boot', () => {
        expect(pkg.scripts.start).toContain('ts-node/register/transpile-only');
    });
});
