# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single project (not a monorepo). A browser DAW (digital audio workstation) built ~2018–2020: Web Audio synths/effects, a step/piano-roll sequencer, WebMIDI input, and sampled instruments. Express backend (`@overnightjs/core`) in `src/DawApi/`, React/Redux client app in `src/public/daw/`, Webpack 5 config in `src/webpackCfg/`. Entry point: `src/start.ts`. Deploys to Fly.io (`fly.toml`, app `pqsound`). Live demo: https://pqsound.fly.dev/.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues (`ItsPatrq/PqSound`), managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

## Commands

- `npm run start:local` — dev server via nodemon + ts-node, watches `src` (excludes `src/public`).
- `npm run start:local:so` — same, but `SERVER_ONLY=true` (skips the dev client middleware/webpack-dev-middleware).
- `npm run build` / `npm run build:local` — Webpack production/local bundle.
- `npm run lint` — `eslint --fix`. This is also the formatter: Prettier runs through `eslint-plugin-prettier`, so there is no separate `format` script — always use `npm run lint`, not `prettier` directly.
- `npm test` — runs Jest (`ts-jest`). Test files live alongside source as `*.test.ts` (already excluded from the production `tsconfig.json` build).

## Architecture map

- `src/start.ts` → `src/DawApi/DawApiServer.ts` (overnightjs `Server` subclass). In `NODE_ENV=local` (unless `SERVER_ONLY=true`) it mounts webpack-dev-middleware + hot middleware; otherwise serves the prebuilt `dist/assets` bundle.
- `src/DawApi/controllers/` — `DemoController.ts` (`/api/say-hello/:name`) and `SamplerController.js` (`/api/samplerinstrument/*`, streams sample files from `assets/audio/samples/instruments/`; path-traversal guarded).
- Client (`src/public/daw/js/`):
  - `engine/` (TS) — `Sequencer.ts` (lookahead scheduler, 0.2 s ahead, ticked by an inline-Blob Web Worker on an 80 ms `setTimeout` — the standard "tale of two clocks" pattern, still valid), `Sound.ts` (note on/off dispatch), `Track.ts` (per-track Web Audio node graph: gain/mute/pan/analysers), `MIDIController.ts` (WebMIDI), `BufferLoader.ts`, `CompositionParser.ts`.
  - `instruments/` (TS) — `PqSynth`, `Monotron`, `MultiOsc`, `Sampler`, per-note `Voice`. All native Web Audio nodes; no `ScriptProcessorNode` anywhere (good — no AudioWorklet migration forced).
  - `plugins/` (TS) — effects (Chorus, Compressor, Delay, Distortion, Equalizer, Reverb) wrapping native nodes, chained in `Track.getPluginChainNode()`.
  - `components/` + `containers/` — React UI: `.jsx` class components with `react-redux` `connect` for containers, mix of class/function presentational components.
  - `reducers/` — six RTK `createSlice` slices (`tracks`, `composition`, `control`, `keyboard`, `webAudio`, `trackDetails`). Each exports its reducer as the default and its generated action creators as named exports; import creators from the slice. `actions/` holds only the three modules that still have thunks (`trackListActions`, `controlActions`, `webAudioActions`) — the thunks are the ones that must touch `AudioEngine` before dispatching.
  - `store.js` — the Redux store (`configureStore`, with `serializableCheck` and `immutableCheck` both on). It was called `stroe.js` until 2026-08; that typo is gone.
  - `config/` — picked by the webpack `config` alias via `REACT_WEBPACK_ENV`; `index.ts` also branches on `NODE_HOST === 'heroku'`, a leftover from the pre-Fly.io Heroku deployment.
- `assets/` — ~85 MB of instrument samples (DSKGrandPiano, RockKit, SlingerlandKit).

### Engine / store split (the thing to understand first)

This used to be the codebase's biggest structural problem — live `AudioContext`, `Track`, instrument and plugin objects lived *in* Redux state, and the engine reached back into the store. It was resolved across #221–#240; the shape now is:

- **`engine/AudioEngine.ts` owns every live object**: the `AudioContext`, the `Sound` dispatcher, decoded sample buffers, the `Sequencer` and `MIDIController` singletons, and per-track registries for the `Track` node, the instrument and the plugin chain. Track-scoped registries are keyed by the track's **stable `id`**, never its `index` — `index` is renumbered whenever a track is removed or reordered.
- **The store holds only serializable descriptors** — `{ id, name, preset }` for an instrument, `{ id, name, index, preset }` per plugin, and so on. `configureStore` runs `serializableCheck` *and* `immutableCheck`; `playwright/ui-integrations/serializability.spec.ts` fails the build if either middleware ever complains, since they only log.
- **Reducers are pure.** Anything that constructs or mutates a Web Audio node happens in a thunk in `actions/trackListActions.js`, which then dispatches a descriptor.
- **The engine never reads the store.** `engine/EngineStore.ts` subscribes once and keeps an `EngineSnapshot` (bpm, loop range, region list, `{ index, id, record }` per track, notes playing); `Sequencer`, `Sound` and `MIDIController` read that snapshot and dispatch through the same module. Nothing under `engine/` imports `store.js`.
- **`engine/CompositionParser.ts` is pure** — every function takes its region data as an argument, so the UI passes props and the scheduler passes its per-tick snapshot.

If you add state, keep it serializable and put the live object in `AudioEngine`. The tests that protect this are `reducers/*.test.ts` (36 cases on `tracks`/`composition` alone), `actions/trackListActions.test.ts`, and the Playwright specs.

## Modernization notes (state of the stack, 2026)

Largely modernized as of 2026-08: TypeScript 6, Webpack 5, Node 22 (LTS), Express 5, React 19, Redux Toolkit, ESLint 10 / typescript-eslint 8, react-bootstrap dropped, plus CI, 161 Jest tests and 18 Playwright e2e specs. The one remaining ~2020 dependency is `overnightjs`. Inventory:

| Area | Current | Target / note |
|---|---|---|
| Node | **Node 22.23.1 (LTS)**: `engines` `>=22.0.0`, Docker `NODE_VERSION=22.23.1`, CI `node-version: 22`, `.nvmrc` `22.23.1` (all aligned) | On current LTS. Node 22 ships npm 10 (strict peer-dep resolution) — the Dockerfile build-stage `npm ci` uses `--legacy-peer-deps` to match CI and the lockfile. The `--openssl-legacy-provider` flag is **gone** (Webpack 5 dropped the md4 need); Dockerfile sets no `NODE_OPTIONS`. Don't reintroduce the flag. |
| Bundler | **Webpack 5.109.2** + webpack-cli 7 | Upgrade done. `mini-css-extract-plugin@2` (css-loader 7, style-loader), `html-webpack-plugin@5`, `fork-ts-checker-webpack-plugin@9`, `ts-loader@9` in place. Dead plugins removed: `extract-text-webpack-plugin`, `hard-source-webpack-plugin`, `awesome-typescript-loader`, `eslint-loader`, `node: { fs: 'empty' }` all gone. The webpack aliases are now mirrored in `tsconfig` `paths` **and** Jest `moduleNameMapper` — keep the three lists in sync when adding one. |
| TypeScript | **6.0.3** | Done. `skipLibCheck: true`; toolchain on `ts-jest@29`, `ts-node@10`, `fork-ts-checker@9`, `tslib`. Typecheck runs standalone via `npm run typecheck` (build uses `ts-loader` `transpileOnly`). `noImplicitAny: false` still masks a lot — the `engine/` files carry a few dozen explicit/implicit `any`s. |
| React | **19.2.8**, `createRoot` (`src/public/daw/js/index.js`) | Done. ~10 class components remain; converting them to hooks is optional and can be incremental. |
| react-bootstrap | **removed** | Dropped during the dark re-skin; layout is plain markup + the project's own CSS. `components/Dropdown.jsx` and `components/Modal.jsx` are the dependency-free replacements. |
| Redux | **Redux Toolkit 2**: `configureStore`, six `createSlice` slices, thunks for engine-touching actions | Done. Both `serializableCheck` and `immutableCheck` are on, guarded by an e2e spec. `redux-thunk` and `redux-devtools-extension` are gone — RTK provides both. |
| ESLint | **10** + typescript-eslint 8, flat config (`eslint.config.js`) | Done. Lint is still the formatter (Prettier via `eslint-plugin-prettier`) — run `npm run lint`, never `prettier` directly. |
| Server | **overnightjs** (unmaintained since ~2020) on Express 5.2.1 | The last stale dependency. Replace with a plain Express router — the decorator controllers are trivial to inline. `body-parser` is already gone (built-in `express.json()`/`express.urlencoded()`). |
| Tests | Jest: **15 suites / 161 tests** — the six slices, `trackListActions`, the engine modules and `DemoController`. Global `testEnvironment: node`; client suites opt into jsdom with a `@jest-environment jsdom` docblock. Aliases resolve via `moduleNameMapper`. Plus **18 Playwright e2e specs** in `playwright/` (`test:e2e`, `test:e2e:ui`). | The e2e suite is the only thing that catches first-render crashes — it has caught two. Add a spec when you touch a UI flow. |
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

Also fixed: the missing `Sampler` import that made `ADD_TRACK` throw; `CHANGE_TRACK_OUTPUT` passing an output *index* where `Track.updateTrackNode` expects an `AudioNode`; `TrackDetails.handleAddPlugin` reading the new plugin's index from stale props (it opened the previous plugin, or nothing for the first); `Utils.copy`'s `instanceof AudioContext` test, which threw in jsdom/node.

Still open:
- `DawApiServer.ts`: the `SERVER_START_MSG` ternary is correct but pointless — both non-literal branches use `process.env.hostName`. Cosmetic.
- A few dozen explicit/implicit `any`s remain in `engine/` under `noImplicitAny: false`.
- The engine snapshot (`EngineStore`) is rebuilt on every dispatch, including `UPDATE_CURRENT_TIME` at ~8×/second during playback. Memoize with `reselect` if it ever shows up in a profile — not measured yet.
- `reducers/*Reducer.js` still say "reducer" while holding slices; renaming to `slices/*Slice.js` is cosmetic and touches every import.

### Suggested modernization order

1. ~~CI (lint/test/build) + engine unit tests~~ — done.
2. ~~Bundler swap → Webpack 5, Node 22 LTS, drop the OpenSSL flag, align `engines`~~ — done.
3. ~~TypeScript 5/6 + ESLint 9/10 + typescript-eslint 8~~ — done.
4. ~~React 19 (`createRoot`); drop react-bootstrap; remove the dead `@types/styled-components` dep~~ — done.
5. ~~Extract the audio engine out of Redux state~~ — done, see "Engine / store split" above.
6. ~~Redux Toolkit; rename `stroe.js` → `store.js`~~ — done, all six slices on `createSlice`.
7. **Server cleanup: drop overnightjs — the one substantial item left.** Done already: `body-parser` → built-in `express.json()`/`express.urlencoded()`, dead `ClassicalPiano` mimeType removed, webpack imports moved behind the dev branch.

Each step is independently shippable; don't combine unrelated upgrades in one branch.

## Conventions

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Gotchas

- `tsconfig.json` has `strict: true` and `strictNullChecks: true`, but `noImplicitAny: false` — an explicit partial opt-out, not an oversight.
- `engines.node` is `>=22.0.0`, the `Dockerfile` uses `ARG NODE_VERSION=22.23.1`, CI runs `node-version: 22`, and `.nvmrc` is `22.23.1` — all aligned on Node 22 LTS. The Docker build-stage `npm ci` needs `--legacy-peer-deps` (npm 10 strict peers). No `--openssl-legacy-provider` / `NODE_OPTIONS` anymore (Webpack 5 dropped the md4 dependency). Don't reintroduce the flag.
- Controllers under `src/DawApi/controllers/` are a mix of `.ts` and plain `.js` files — this is intentional/legacy, not a build error.
- Env vars in use: `PORT`, `NODE_ENV`, `NODE_HOST`, `SERVER_ONLY`, `REACT_WEBPACK_ENV`, and a lowercase `hostName` — none are documented elsewhere, so check actual usages (`grep`) before assuming behavior.
- CI is configured: `.github/workflows/ci.yml` and `codeql.yml` exist.
- Client imports use webpack aliases (`engine/...`, `components/...`, `constants/...`). They are declared in **three** places that must stay in sync: `src/webpackCfg/defaults.ts`, `tsconfig.json` `paths`, and `jest.config.js` `moduleNameMapper`. The bare `constants` alias is deliberately **not** mapped in Jest — it collides with the Node builtin that `graceful-fs` requires.
- `Utils.copy` returns `null` for a Web Audio context and deep-copies everything else. It identifies the context by constructor name, so it is safe in node and jsdom.
- RTK types a no-payload action creator's argument as `void`, which TypeScript will not accept as *zero* arguments from a `.ts` test — pass `undefined` explicitly there. The app's `.jsx` call sites are unchecked and call them bare.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Setup (once per machine/session): `uv tool install graphifyy` (the PyPI name has a double y; the CLI is `graphify`). Git hooks and the `graph.json` merge driver are registered automatically by `npm install` (the `prepare` script). Without the CLI everything degrades gracefully - hooks and Claude hook-guards no-op. Indexing scope is controlled by `.graphifyignore` (gitignore syntax, git-ignored paths are excluded automatically).

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
