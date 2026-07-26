# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single project (not a monorepo). A browser DAW (digital audio workstation) built ~2018–2020: Web Audio synths/effects, a step/piano-roll sequencer, WebMIDI input, and sampled instruments. Express backend (`@overnightjs/core`) in `src/DawApi/`, React/Redux client app in `src/public/daw/`, Webpack 5 config in `src/webpackCfg/`. Entry point: `src/start.ts`. Deploys to Fly.io (`fly.toml`, app `pqsound`). Live demo: https://pqsound.fly.dev/.

## Commands

- `npm run start:local` — dev server via nodemon + ts-node, watches `src` (excludes `src/public`).
- `npm run start:local:so` — same, but `SERVER_ONLY=true` (skips the dev client middleware/webpack-dev-middleware).
- `npm run build` / `npm run build:local` — Webpack production/local bundle.
- `npm run lint` — `eslint --fix`. This is also the formatter: Prettier runs through `eslint-plugin-prettier`, so there is no separate `format` script — always use `npm run lint`, not `prettier` directly.
- `npm test` — runs Jest (`ts-jest`). Test files live alongside source as `*.test.ts` (already excluded from the production `tsconfig.json` build).

## Architecture map

- `src/start.ts` → `src/DawApi/DawApiServer.ts` (overnightjs `Server` subclass). In `NODE_ENV=local` (unless `SERVER_ONLY=true`) it mounts webpack-dev-middleware + hot middleware; otherwise serves the prebuilt `dist/assets` bundle.
- `src/DawApi/controllers/` — `DemoController.ts` (`/api/say-hello/:name`, has the only test) and `SamplerController.js` (`/api/samplerinstrument/*`, streams sample files from `assets/audio/samples/instruments/`).
- Client (`src/public/daw/js/`):
  - `engine/` (TS) — `Sequencer.ts` (lookahead scheduler, 0.2 s ahead, ticked by an inline-Blob Web Worker on an 80 ms `setTimeout` — the standard "tale of two clocks" pattern, still valid), `Sound.ts` (note on/off dispatch), `Track.ts` (per-track Web Audio node graph: gain/mute/pan/analysers), `MIDIController.ts` (WebMIDI), `BufferLoader.ts`, `CompositionParser.ts`.
  - `instruments/` (TS) — `PqSynth`, `Monotron`, `MultiOsc`, `Sampler`, per-note `Voice`. All native Web Audio nodes; no `ScriptProcessorNode` anywhere (good — no AudioWorklet migration forced).
  - `plugins/` (TS) — effects (Chorus, Compressor, Delay, Distortion, Equalizer, Reverb) wrapping native nodes, chained in `Track.getPluginChainNode()`.
  - `components/` + `containers/` — React UI: `.jsx` class components with `react-redux` `connect` for containers, mix of class/function presentational components. `reducers/`, `actions/` — classic hand-rolled Redux (string action types, thunk).
  - `stroe.js` — the Redux store. Yes, the filename is a typo ("stroe"), and every import references it as such. Renaming it touches many files; do it as an isolated commit.
  - `config/` — picked by the webpack `config` alias via `REACT_WEBPACK_ENV`; `index.ts` also branches on `NODE_HOST === 'heroku'`, a leftover from the pre-Fly.io Heroku deployment.
- `assets/` — ~85 MB of instrument samples (DSKGrandPiano, RockKit, SlingerlandKit). Note: `SamplerController` also routes `ClassicalPiano`, but that directory does not exist on disk.

### Key coupling to know before refactoring

The Redux store holds **non-serializable live objects**: `webAudioReducer` keeps the `AudioContext`, `Sound` instance, `BufferLoader`, and sample buffers in state; tracks state holds live `Track`/instrument instances; the `MIDIController` instance is dispatched into state too. Conversely, the engine classes (`Sequencer`, `Sound`, `MIDIController`) reach directly into `Store.getState()`/`Store.dispatch`. UI ↔ engine communication goes *through* Redux in both directions. Any state-management modernization (Redux Toolkit, serializability checks, time-travel) requires first extracting the audio objects into a standalone engine/service layer, keeping only serializable descriptors in the store. This is the single biggest structural constraint in the codebase.

## Modernization notes (state of the stack, 2026)

Partly modernized (2026): TypeScript 5, Webpack 5, Node 22 (LTS), Express 5, CI + Jest engine tests + Playwright e2e are in. Still on the ~2020 snapshot: React 16, Redux 4 (hand-rolled), ESLint 7 / typescript-eslint 2, overnightjs. Inventory of what's still outdated and what replacing it implies:

| Area | Current | Target / note |
|---|---|---|
| Node | **Node 22.23.1 (LTS)**: `engines` `>=22.0.0`, Docker `NODE_VERSION=22.23.1`, CI `node-version: 22`, `.nvmrc` `22.23.1` (all aligned) | On current LTS. Node 22 ships npm 10 (strict peer-dep resolution) — the Dockerfile build-stage `npm ci` uses `--legacy-peer-deps` to match CI and the lockfile. The `--openssl-legacy-provider` flag is **gone** (Webpack 5 dropped the md4 need); Dockerfile sets no `NODE_OPTIONS`. Don't reintroduce the flag. |
| Bundler | **Webpack 5.108.4** + webpack-cli 7.2.1 | Upgrade done. `mini-css-extract-plugin@2` (css-loader 7, style-loader), `html-webpack-plugin@5`, `fork-ts-checker-webpack-plugin@9`, `ts-loader@9` in place. Dead plugins removed: `extract-text-webpack-plugin`, `hard-source-webpack-plugin`, `awesome-typescript-loader`, `eslint-loader`, `node: { fs: 'empty' }` all gone. Remaining: Webpack aliases (`actions`, `engine`, `components`, …) are still NOT reproduced in `tsconfig` `paths` or Jest `moduleNameMapper` — alias-importing client tests can't run (engine tests dodge this with relative imports). |
| TypeScript | 5.6.3 (upgraded from 3.9.7) | Done. `tsc --noEmit` now parses modern dep `.d.ts` (was blocked on TS 3.9). `skipLibCheck: true` added; toolchain bumped (`ts-jest@29`, `ts-node@10`, `fork-ts-checker@9`, `tslib`). Typecheck runs standalone via `npm run typecheck` (build still uses `ts-loader` `transpileOnly`). `noImplicitAny: false` still masks a lot (engine files carry many implicit/explicit `any`s). ESLint stack (`typescript-eslint@2`) NOT yet upgraded — separate step. |
| React | 16.13.1, `ReactDOM.render` (`src/public/daw/js/index.js:10`) | 18+: `createRoot`. The `react/lib/ReactMount` alias is already gone. Legacy lifecycle in `containers/Keyboard.jsx:222` already renamed to `UNSAFE_componentWillMount` (18-safe); no `componentWillReceiveProps` left. ~10 class components total; feasible to convert to hooks incrementally. |
| react-bootstrap | 0.31.5 (Bootstrap 3 era, 2017) | Used in 10+ components (modals, grid, nav). Modern react-bootstrap has a completely different API; most layout is custom CSS anyway — evaluate dropping it for plain markup + the existing CSS rather than migrating. |
| Redux | redux 4 + thunk + `redux-devtools-extension` (deprecated package) + hand-rolled reducers | Redux Toolkit — but **only after** the engine/store decoupling above; RTK's default serializability middleware will scream at the current state shape. |
| ESLint | 7 + `@typescript-eslint` 2 | 9 flat config + typescript-eslint 8. Keep the "lint is the formatter" setup or move to standalone Prettier — pick one, update CLAUDE.md. |
| Server | overnightjs (unmaintained since ~2020) on **Express 5.2.1**, still importing the `body-parser` package | Plain Express router (decorator controllers are trivial to inline). Express 5 has built-in `express.json()`/`express.urlencoded()` — `body-parser` is now only a transitive dep but `DawApiServer.ts` still imports the standalone package; swap to the built-ins and drop the import. |
| styled-components | Only `@types/styled-components` installed; the library itself is not used | Remove the types dep. Styling is plain CSS files + `normalize.css`. |
| Tests | Jest: `DemoController.test.ts` + 5 engine tests (`Sound`, `Sequencer`, `Utils`, `CompositionParser`, `Track`). `testEnvironment: node`, no `moduleNameMapper`. Plus Playwright e2e in `playwright/` (`test:e2e`, `test:e2e:ui`). | Engine tests use **relative** imports to sidestep the missing alias mapper; alias-importing client tests still need `moduleNameMapper` + a jsdom env + `AudioContext`/`Worker` mocks. |
| CI | **Present**: `.github/workflows/ci.yml` + `codeql.yml` | Safety net exists. |

### Known bugs / smells

Fixed (kept here so they aren't "rediscovered"):
- ~~`SamplerController.js` path traversal~~ — now uses `req.params[0]` + `path.resolve` + a `startsWith(instrumentsPath + path.sep)` guard (returns 403 on `../`).
- ~~`SamplerController.js` dead `ClassicalPiano` mimeType~~ — removed (no sample dir on disk; real ones are `DSKGrandPiano`, `RockKit`, `SlingerlandKit`).
- ~~`DawApiServer.ts` `SERVER_START_MSG` precedence~~ — the ternary is now parenthesized correctly.
- ~~eager `webpack(config)` at boot~~ — `compiler` is now optional and only instantiated inside `setupFrontEnd()` when `shouldBuildFront`.
- ~~`DawApiServer.ts` top-level webpack import (prod module-load coupling)~~ — webpack/config/dev-middleware are now `require()`d lazily inside the `setupFrontEnd()` dev branch; the only remaining webpack reference at module scope is a `import type` (erased at compile). Production start no longer loads the webpack graph. Also swapped the `body-parser` package for the built-in `express.json()`/`express.urlencoded()`.
- ~~`webAudioReducer.js` `alert()`~~ — now `console.error` (still a `//TODO` to surface an error panel).
- ~~`webkitAudioContext` fallback~~ — gone; reducer uses bare `new AudioContext()`.

Still open:
- **Deferred (blocked): move `webpack`/`webpack-cli`/`webpack-dev-middleware`/`webpack-hot-middleware`/`html-webpack-plugin`/`file-loader` from `dependencies` → `devDependencies` and drop the dead `@types/styled-components` dep.** The runtime coupling itself is already gone (lazy import above); this remaining move only matters for `npm prune --omit=dev` shrinking the prod image. It's blocked because regenerating `package-lock.json` locally drops the lockfile's top-level `jest-util@30.4.1` (a pre-existing jest-ecosystem version skew: `jest@27` + `ts-jest@29`), which breaks `npm test`. Do this in a CI-matching env (node 18, `npm ci --legacy-peer-deps`) or after realigning the jest/ts-jest versions — not via a local `npm install`.
- `DawApiServer.ts:16`: the `SERVER_START_MSG` ternary is correct but pointless — both non-literal branches use `process.env.hostName`. Cosmetic.
- Redux store file is still `stroe.js` (typo). ~45 explicit/implicit `any`s remain in `engine/` under `noImplicitAny: false`.
- Jest/ts-jest version skew (`jest@27`, `ts-jest@29`, lockfile `jest-util@30`) makes `npm install` locally drop `jest-util` unless it's force-added; align these versions.

### Suggested modernization order

1. ~~CI (lint/test/build) + engine unit tests~~ — done (workflows + Jest engine tests + Playwright e2e).
2. ~~Bundler swap → Webpack 5 + Node 17.5.0 + drop OpenSSL flag; align `engines`~~ — done.
3. ~~TypeScript 5~~ (done — TS 5.6.3) + ESLint 9/typescript-eslint 8 (**still pending** — currently ESLint 7.32 + `@typescript-eslint/parser` 2.31).
4. React 18 (`createRoot` at `index.js:10`); decide react-bootstrap's fate. Remove the dead `@types/styled-components` dep (library already gone) — deferred, needs a lockfile regen (see "Still open").
5. Extract audio engine out of Redux state (interface: store holds serializable track/composition descriptors, engine subscribes/exposes an API).
6. Redux Toolkit (still redux 4 + thunk + deprecated `redux-devtools-extension`); rename `stroe.js` → `store.js` along the way.
7. Server cleanup: drop overnightjs (remaining). Done: `body-parser` → built-in `express.json()`/`express.urlencoded()`, dead `ClassicalPiano` mimeType removed, webpack imports moved behind the dev branch.

Each step is independently shippable; don't combine bundler + React + Redux changes in one branch.

## Conventions

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Gotchas

- `tsconfig.json` has `strict: true` and `strictNullChecks: true`, but `noImplicitAny: false` — an explicit partial opt-out, not an oversight.
- `engines.node` is `>=22.0.0`, the `Dockerfile` uses `ARG NODE_VERSION=22.23.1`, CI runs `node-version: 22`, and `.nvmrc` is `22.23.1` — all aligned on Node 22 LTS. The Docker build-stage `npm ci` needs `--legacy-peer-deps` (npm 10 strict peers). No `--openssl-legacy-provider` / `NODE_OPTIONS` anymore (Webpack 5 dropped the md4 dependency). Don't reintroduce the flag.
- Controllers under `src/DawApi/controllers/` are a mix of `.ts` and plain `.js` files — this is intentional/legacy, not a build error.
- Env vars in use: `PORT`, `NODE_ENV`, `NODE_HOST`, `SERVER_ONLY`, `REACT_WEBPACK_ENV`, and a lowercase `hostName` — none are documented elsewhere, so check actual usages (`grep`) before assuming behavior.
- CI is configured: `.github/workflows/ci.yml` and `codeql.yml` exist.
- The Redux store file is `src/public/daw/js/stroe.js` (typo is load-bearing — imports reference it). Searching for `store.js` finds nothing.
- Client imports use webpack aliases (`engine/...`, `components/...`, `constants/...`) defined in `src/webpackCfg/defaults.ts` — plain Node/ts-node cannot resolve client modules, and Jest currently has no `moduleNameMapper` for them (client code is effectively untestable until that's added).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Setup (once per machine/session): `uv tool install graphifyy` (the PyPI name has a double y; the CLI is `graphify`). Git hooks and the `graph.json` merge driver are registered automatically by `npm install` (the `prepare` script). Without the CLI everything degrades gracefully - hooks and Claude hook-guards no-op. Indexing scope is controlled by `.graphifyignore` (gitignore syntax, git-ignored paths are excluded automatically).

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
