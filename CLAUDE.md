# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repo.

## Project

Single project (not monorepo). Browser DAW (digital audio workstation) built ~2018–2020: Web Audio synths/effects, step/piano-roll sequencer, WebMIDI input, sampled instruments. Express 5 backend in `src/DawApi/`, React/Redux client in `src/public/daw/`, Webpack 5 config in `src/webpackCfg/`. Entry point: `src/start.ts`. Deploys to Fly.io (`fly.toml`, app `pqsound`). Live demo: https://pqsound.fly.dev/.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues (`ItsPatrq/PqSound`), managed with `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

## Commands

- `npm run start:local` — dev server via nodemon + ts-node, watches `src` (excludes `src/public`).
- `npm run start:local:so` — same, but `SERVER_ONLY=true` (skips dev client middleware/webpack-dev-middleware).
- `npm run build` / `npm run build:local` — Webpack production/local bundle.
- `npm run lint` — `eslint --fix`. Also the formatter: Prettier runs through `eslint-plugin-prettier`, so no separate `format` script — always `npm run lint`, never `prettier` directly.
- `npm test` — Jest (`ts-jest`). Test files sit beside source as `*.test.ts` (already excluded from production `tsconfig.json` build).

## Architecture map

- `src/start.ts` → `src/DawApi/DawApiServer.ts` (plain Express app; overnightjs dropped in #242). In `NODE_ENV=local` (unless `SERVER_ONLY=true`) mounts webpack-dev-middleware + hot middleware; else serves prebuilt `dist/assets` bundle.
- `src/DawApi/controllers/` — `DemoController.ts` (`/api/say-hello/:name`) and `SamplerController.js` (`/api/samplerinstrument/*`, streams sample files from `assets/audio/samples/instruments/`; path-traversal guarded).
- Client (`src/public/daw/js/`):
  - `engine/` (TS) — `Sequencer.ts` (lookahead scheduler, 0.2 s ahead, ticked by inline-Blob Web Worker on 80 ms `setTimeout` — standard "tale of two clocks" pattern, still valid), `Sound.ts` (note on/off dispatch), `Track.ts` (per-track Web Audio node graph: gain/mute/pan/analysers), `MIDIController.ts` (WebMIDI), `BufferLoader.ts`, `CompositionParser.ts`.
  - `instruments/` (TS) — `PqSynth`, `Monotron`, `MultiOsc`, `Sampler`, per-note `Voice`. All native Web Audio nodes; no `ScriptProcessorNode` anywhere (good — no forced AudioWorklet migration).
  - `plugins/` (TS) — effects (Chorus, Compressor, Delay, Distortion, Equalizer, Reverb) wrapping native nodes, chained in `Track.getPluginChainNode()`.
  - `components/` + `containers/` — React UI: `.jsx` class components with `react-redux` `connect` for containers, mix of class/function presentational components.
  - `slices/` — six RTK `createSlice` slices (`tracks`, `composition`, `control`, `keyboard`, `webAudio`, `trackDetails`). Each exports reducer as default, generated action creators as named exports; import creators from the slice. `actions/` holds only three modules that still have thunks (`trackListActions`, `controlActions`, `webAudioActions`) — those thunks must touch `AudioEngine` before dispatching.
  - `store.js` — Redux store (`configureStore`, `serializableCheck` and `immutableCheck` both on). Was called `stroe.js` until 2026-08; typo gone.
  - `config/` — picked by webpack `config` alias via `REACT_WEBPACK_ENV`; `index.ts` also branches on `NODE_HOST === 'heroku'`, leftover from pre-Fly.io Heroku deploy.
- `assets/` — ~85 MB instrument samples (DSKGrandPiano, RockKit, SlingerlandKit).

### Engine / store split (the thing to understand first)

Used to be codebase's biggest structural problem — live `AudioContext`, `Track`, instrument and plugin objects lived *in* Redux state, engine reached back into store. Resolved across #221–#240. Shape now:

- **`engine/AudioEngine.ts` owns every live object**: `AudioContext`, `Sound` dispatcher, decoded sample buffers, `Sequencer` and `MIDIController` singletons, per-track registries for `Track` node, instrument and plugin chain. Track-scoped registries keyed by track's **stable `id`**, never `index` — `index` renumbers whenever track removed or reordered.
- **Store holds only serializable descriptors** — `{ id, name, preset }` for instrument, `{ id, name, index, preset }` per plugin, etc. `configureStore` runs `serializableCheck` *and* `immutableCheck`; `playwright/ui-integrations/serializability.spec.ts` fails build if either middleware complains, since they only log.
- **Reducers pure.** Anything constructing or mutating Web Audio node happens in thunk in `actions/trackListActions.js`, which then dispatches descriptor.
- **Engine never reads store.** `engine/EngineStore.ts` subscribes once and keeps `EngineSnapshot` (bpm, loop range, region list, `{ index, id, record }` per track, notes playing); `Sequencer`, `Sound` and `MIDIController` read that snapshot and dispatch through same module. Nothing under `engine/` imports `store.js`.
- **`engine/CompositionParser.ts` pure** — every function takes region data as argument, so UI passes props and scheduler passes its per-tick snapshot.

Add state → keep serializable, put live object in `AudioEngine`. Tests protecting this: `slices/*.test.ts` (36 cases on `tracks`/`composition` alone), `actions/trackListActions.test.ts`, Playwright specs.

## Modernization notes (state of the stack, 2026)

Largely modernized as of 2026-08: TypeScript 6, Webpack 5, Node 22 (LTS), Express 5, React 19, Redux Toolkit, ESLint 10 / typescript-eslint 8, react-bootstrap dropped, overnightjs dropped, plus CI, 187 Jest tests, 19 Playwright e2e specs. No pre-2021 dependencies remain. Inventory:

| Area | Current | Target / note |
|---|---|---|
| Node | **Node 22.23.1 (LTS)**: `engines` `>=22.0.0`, Docker `NODE_VERSION=22.23.1`, CI `node-version: 22`, `.nvmrc` `22.23.1` (all aligned) | On current LTS. Node 22 ships npm 10 (strict peer-dep resolution) — Dockerfile build-stage `npm ci` uses `--legacy-peer-deps` to match CI and lockfile. `--openssl-legacy-provider` flag **gone** (Webpack 5 dropped md4 need); Dockerfile sets no `NODE_OPTIONS`. Don't reintroduce flag. |
| Bundler | **Webpack 5.109.2** + webpack-cli 7 | Upgrade done. `mini-css-extract-plugin@2` (css-loader 7, style-loader), `html-webpack-plugin@5`, `fork-ts-checker-webpack-plugin@9`, `ts-loader@9` in place. Dead plugins removed: `extract-text-webpack-plugin`, `hard-source-webpack-plugin`, `awesome-typescript-loader`, `eslint-loader`, `node: { fs: 'empty' }` all gone. Webpack aliases now mirrored in `tsconfig` `paths` **and** Jest `moduleNameMapper` — keep three lists in sync when adding one. |
| TypeScript | **6.0.3** | Done. `skipLibCheck: true`; toolchain on `ts-jest@29`, `ts-node@10`, `fork-ts-checker@9`, `tslib`. Typecheck runs standalone via `npm run typecheck` (build uses `ts-loader` `transpileOnly`). `noImplicitAny: false` still masks a lot — `engine/` files carry few dozen explicit/implicit `any`s. |
| React | **19.2.8**, `createRoot` (`src/public/daw/js/index.js`) | Done. ~10 class components remain; converting to hooks optional, can be incremental. |
| react-bootstrap | **removed** | Dropped during dark re-skin; layout is plain markup + project's own CSS. `components/Dropdown.jsx` and `components/Modal.jsx` are dependency-free replacements. |
| Redux | **Redux Toolkit 2**: `configureStore`, six `createSlice` slices, thunks for engine-touching actions | Done. Both `serializableCheck` and `immutableCheck` on, guarded by e2e spec. `redux-thunk` and `redux-devtools-extension` gone — RTK provides both. |
| ESLint | **10** + typescript-eslint 8, flat config (`eslint.config.js`) | Done. Lint still the formatter (Prettier via `eslint-plugin-prettier`) — run `npm run lint`, never `prettier` directly. |
| Server | **Plain Express 5.2.1** — `DawApiServer.ts` builds the app, `controllers/*` export routers | Done (#242). overnightjs gone; `src/DawApi/logger.ts` is the ~20-line replacement for `@overnightjs/logger` and strips CR/LF (log-injection fix). The sampler route is rate-limited (`express-rate-limit`, 600/min). `body-parser` gone too (built-in `express.json()`/`express.urlencoded()`). |
| Tests | Jest: **17 suites / 187 tests** — six slices, `trackListActions`, engine modules, both controllers, `store-boundaries`. Global `testEnvironment: node`; client suites opt into jsdom with `@jest-environment jsdom` docblock. Aliases resolve via `moduleNameMapper`. Plus **19 Playwright e2e specs** in `playwright/` (`test:e2e`, `test:e2e:ui`). | E2e suite only thing catching first-render crashes — caught two so far. Add spec when you touch UI flow. |
| CI | **Present**: `.github/workflows/ci.yml` + `codeql.yml` | Safety net exists. |

### Known bugs / smells

Fixed (kept so they aren't "rediscovered"):
- ~~`SamplerController.js` path traversal~~ — now uses `req.params.splat` (Express 5 named wildcard, `/*splat`; an array or a string) + `path.resolve` + `startsWith(instrumentsPath + path.sep)` guard (403 on `../`).
- ~~`SamplerController.js` dead `ClassicalPiano` mimeType~~ — removed (no sample dir on disk; real ones are `DSKGrandPiano`, `RockKit`, `SlingerlandKit`).
- ~~`DawApiServer.ts` `SERVER_START_MSG` precedence~~ — ternary now parenthesized correctly.
- ~~eager `webpack(config)` at boot~~ — `compiler` now optional, instantiated only inside `setupFrontEnd()` when `shouldBuildFront`.
- ~~`DawApiServer.ts` top-level webpack import (prod module-load coupling)~~ — webpack/config/dev-middleware now `require()`d lazily inside `setupFrontEnd()` dev branch; only remaining webpack reference at module scope is `import type` (erased at compile). Production start no longer loads webpack graph. Also swapped `body-parser` package for built-in `express.json()`/`express.urlencoded()`.
- ~~`webAudioSlice.js` `alert()`~~ — now `console.error` (still `//TODO` to surface error panel).
- ~~`webkitAudioContext` fallback~~ — gone; slice uses bare `new AudioContext()`.
- ~~`reducers/*Reducer.js` naming~~ — directory is `slices/`, files are `*Slice.js`; alias is `slices/` in all three places (webpack, tsconfig, Jest).

Also fixed: missing `Sampler` import that made `ADD_TRACK` throw; `CHANGE_TRACK_OUTPUT` passing output *index* where `Track.updateTrackNode` expects `AudioNode`; `TrackDetails.handleAddPlugin` reading new plugin's index from stale props (opened previous plugin, or nothing for first); `Utils.copy`'s `instanceof AudioContext` test, which threw in jsdom/node.

From the 2026-08 two-pass review sweep:
- ~~Web Audio nodes never disconnected~~ (#249/#255) — `Track.dispose()` exists now, and teardown lives in `AudioEngine`'s `remove*`/`clear*` rather than in the thunks, so a caller cannot forget it. `removePlugin` detaches **before** splicing, since `updateTrackNode` only disconnects plugins still in the list. All idempotent (disconnecting twice is a Web Audio no-op).
- ~~`Sequencer` stop timer never cancelled~~ (#250/#256) — `handleStop`'s 80 ms reset now retains its id; `handlePlay`/`handlePause` cancel it. Stop→play inside 80 ms used to kill the notes the new run had just scheduled. The worker blob URL is revoked after `new Worker(...)`.
- ~~Sampler instrument whitelist bypassable via `Object.prototype`~~ (#251/#257) — `mimeTypes` is null-prototype **and** the lookup goes through `hasOwnProperty`. `constructor` used to return 200 with `Content-Type: function Object() { [native code] }`. Note `curl` normalizes `../` away — reproducing needs `--path-as-is`.
- **Not a bug, checked twice:** the export payload is percent-encoded in `getExportData()` and again in `export()`. That is correct — `export()` builds a `data:` URL and the browser decodes it once while writing the file, so what lands on disk is single-encoded, matching `loadComposition` and `constants/Demo.js`. Two reviewers called this a double-encode bug; removing the outer encode would break export for any composition containing `#` or `&`. Guarded by `playwright/ui-integrations/export-import.spec.ts`.

Still open:
- `Track.updateInstrument` calls `this.instrument.disconnect()` unguarded, but aux/master tracks are built with `instrument = null` (#252). Reachability unconfirmed — no UI path found that offers an instrument picker on an aux track.
- Unverified single-pass review leads are collected in #253 — treat them as leads, not defects. The two with real blast radius are `BufferLoader`'s un-backed-off retry on any non-2xx, and the rate limiter having no `trust proxy` under Fly's `[http_service]`.
- `DawApiServer.ts`: `SERVER_START_MSG` ternary correct but pointless — both non-literal branches use `process.env.hostName`. Cosmetic.
- Few dozen explicit/implicit `any`s remain in `engine/` under `noImplicitAny: false`.

### Suggested modernization order

1. ~~CI (lint/test/build) + engine unit tests~~ — done.
2. ~~Bundler swap → Webpack 5, Node 22 LTS, drop OpenSSL flag, align `engines`~~ — done.
3. ~~TypeScript 5/6 + ESLint 9/10 + typescript-eslint 8~~ — done.
4. ~~React 19 (`createRoot`); drop react-bootstrap; remove dead `@types/styled-components` dep~~ — done.
5. ~~Extract audio engine out of Redux state~~ — done, see "Engine / store split" above.
6. ~~Redux Toolkit; rename `stroe.js` → `store.js`~~ — done, all six slices on `createSlice`.
7. ~~Server cleanup: drop overnightjs~~ — done (#242). `body-parser` → built-in `express.json()`/`express.urlencoded()`, dead `ClassicalPiano` mimeType removed, webpack imports moved behind dev branch, `http-status-codes` dropped (#246).

The list is complete. Later work is bug-driven rather than modernization: see the "Known bugs / smells" section.

Each step independently shippable; don't combine unrelated upgrades in one branch.

## Conventions

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Gotchas

- `tsconfig.json` has `strict: true` and `strictNullChecks: true`, but `noImplicitAny: false` — explicit partial opt-out, not oversight.
- `engines.node` is `>=22.0.0`, `Dockerfile` uses `ARG NODE_VERSION=22.23.1`, CI runs `node-version: 22`, `.nvmrc` is `22.23.1` — all aligned on Node 22 LTS. Docker build-stage `npm ci` needs `--legacy-peer-deps` (npm 10 strict peers). No `--openssl-legacy-provider` / `NODE_OPTIONS` anymore (Webpack 5 dropped md4 dependency). Don't reintroduce flag.
- Controllers under `src/DawApi/controllers/` are mix of `.ts` and plain `.js` — intentional/legacy, not build error.
- Env vars in use: `PORT`, `NODE_ENV`, `NODE_HOST`, `SERVER_ONLY`, `REACT_WEBPACK_ENV`, and lowercase `hostName` — none documented elsewhere, so check actual usages (`grep`) before assuming behavior.
- CI configured: `.github/workflows/ci.yml` and `codeql.yml` exist.
- Styling is plain CSS files under `src/public/daw/styles/`, design tokens in `theme.css` (`var(--pq-*)`) as single source of truth for colour. No CSS-in-JS — see `docs/adr/0001-plain-css-with-design-tokens.md` for what would reopen that.
- Client imports use webpack aliases (`engine/...`, `components/...`, `constants/...`). Declared in **three** places that must stay in sync: `src/webpackCfg/defaults.ts`, `tsconfig.json` `paths`, `jest.config.js` `moduleNameMapper`. Bare `constants` alias deliberately **not** mapped in Jest — collides with Node builtin that `graceful-fs` requires.
- Engine snapshot (`EngineStore`) rebuilt on every dispatch. Measured, not guessed: 36–90 ns per projection at realistic project sizes, ~0.0008 ms per second of playback. Don't memoize it — see comment on `selectEngineSnapshot`.
- `Utils.copy` returns `null` for Web Audio context, deep-copies everything else. Identifies context by constructor name, so safe in node and jsdom.
- RTK types no-payload action creator's argument as `void`, which TypeScript won't accept as *zero* arguments from `.ts` test — pass `undefined` explicitly there. App's `.jsx` call sites unchecked, call them bare.

## graphify

This project has knowledge graph at graphify-out/ with god nodes, community structure, cross-file relationships.

Setup (once per machine/session): `uv tool install graphifyy` (PyPI name has double y; CLI is `graphify`). Git hooks and `graph.json` merge driver registered automatically by `npm install` (`prepare` script). Without CLI everything degrades gracefully - hooks and Claude hook-guards no-op. Indexing scope controlled by `.graphifyignore` (gitignore syntax, git-ignored paths excluded automatically).

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships, `graphify explain "<concept>"` for focused concepts. These return scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain don't surface enough context.
- After modifying code, run `graphify update .` to keep graph current (AST-only, no API cost).
