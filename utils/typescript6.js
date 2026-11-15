'use strict';
// TypeScript 7 is the native (Go) compiler. `require('typescript')` returns only
// a version string, with no JavaScript compiler API, so `npm run typecheck`
// calls the TS7 `tsc` binary directly.
//
// ts-node, ts-loader, ts-jest and typescript-eslint all drive the compiler
// through that API, and all of them do a bare `require('typescript')` somewhere
// (ts-node and ts-jest even ignore their own `compiler` option on some paths).
// Microsoft ships TS6's API as `@typescript/typescript6` for exactly this case.
// Requiring this file points every `require('typescript')` in the current
// process at it. npm `overrides` cannot do this: `typescript` is a peer
// dependency of those tools, so it stays hoisted next to the TS7 copy.
//
// Loaded by:
//   - package.json `start`/`build`/`build:local` and utils/nodemon.json, via `node -r`
//   - eslint.config.js, before typescript-eslint
//   - utils/ts-jest.js, the Jest transformer (runs in every Jest worker)
//
// Drop it once these tools support TS7's API.
const Module = require('module');

const typescript6 = require.resolve('@typescript/typescript6');

if (!Module._resolveFilename.__typescript6) {
    const resolve = Module._resolveFilename;
    const patched = function (request, parent, ...rest) {
        if (request === 'typescript') return typescript6;
        return resolve.call(this, request, parent, ...rest);
    };
    patched.__typescript6 = true;
    Module._resolveFilename = patched;
}
