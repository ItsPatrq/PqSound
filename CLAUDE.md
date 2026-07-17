# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single project (not a monorepo). A browser DAW (digital audio workstation) built ~2018–2020: Web Audio synths/effects, a step/piano-roll sequencer, WebMIDI input, and sampled instruments. Express backend (`@overnightjs/core`) in `src/DawApi/`, React/Redux client app in `src/public/daw/`, Webpack 4 config in `src/webpackCfg/`. Entry point: `src/start.ts`. Deploys to Fly.io (`fly.toml`, app `pqsound`). Live demo: https://pqsound.fly.dev/.

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

Everything is pinned to a ~2020 snapshot. Inventory of what's outdated and what replacing it implies:

| Area | Current | Target / note |
|---|---|---|
| Node | `engines` 12.16.3, Docker 17.5.0 + `--openssl-legacy-provider` | Current LTS. The OpenSSL flag exists only because of Webpack 4's md4 hashing — dies with the bundler upgrade. |
| Bundler | Webpack 4 + dead plugins | Vite is the natural target (plain TS/JSX/CSS app, no exotic loaders). If staying on Webpack 5: `extract-text-webpack-plugin@4.0.0-beta` → `mini-css-extract-plugin`, drop `hard-source-webpack-plugin` (built-in cache), drop `awesome-typescript-loader` (dead, unused anyway — `ts-loader` does the work), drop `eslint-loader` (deprecated) and `node: { fs: 'empty' }`. Webpack aliases (`actions`, `engine`, `components`, …) must be reproduced in the new bundler **and** in `tsconfig` `paths` + Jest `moduleNameMapper`. |
| TypeScript | 5.6.3 (upgraded from 3.9.7) | Done. `tsc --noEmit` now parses modern dep `.d.ts` (was blocked on TS 3.9). `skipLibCheck: true` added; toolchain bumped (`ts-jest@29`, `ts-node@10`, `fork-ts-checker@9`, `tslib`). Typecheck runs standalone via `npm run typecheck` (build still uses `ts-loader` `transpileOnly`). `noImplicitAny: false` still masks a lot (engine files carry many implicit/explicit `any`s). ESLint stack (`typescript-eslint@2`) NOT yet upgraded — separate step. |
| React | 16.13, `ReactDOM.render` | 18+: `createRoot`, drop the `react/lib/ReactMount` alias (dead relic). Legacy lifecycles (`componentWillMount`/`componentWillReceiveProps`) exist in `containers/Keyboard.jsx` — fix before 18. ~10 class components total; feasible to convert to hooks incrementally. |
| react-bootstrap | 0.31.5 (Bootstrap 3 era, 2017) | Used in 10+ components (modals, grid, nav). Modern react-bootstrap has a completely different API; most layout is custom CSS anyway — evaluate dropping it for plain markup + the existing CSS rather than migrating. |
| Redux | redux 4 + thunk + `redux-devtools-extension` (deprecated package) + hand-rolled reducers | Redux Toolkit — but **only after** the engine/store decoupling above; RTK's default serializability middleware will scream at the current state shape. |
| ESLint | 7 + `@typescript-eslint` 2 | 9 flat config + typescript-eslint 8. Keep the "lint is the formatter" setup or move to standalone Prettier — pick one, update CLAUDE.md. |
| Server | overnightjs (unmaintained since ~2020), `body-parser` package | Plain Express router (decorator controllers are trivial to inline) + `express.json()`. |
| styled-components | Only `@types/styled-components` installed; the library itself is not used | Remove the types dep. Styling is plain CSS files + `normalize.css`. |
| Tests | Single test (`DemoController.test.ts`), `testEnvironment: node` | Client tests need a jsdom environment plus mocks for `AudioContext`/`Worker`. Engine logic (`CompositionParser`, `Utils`, scheduling math) is the most testable and most valuable to cover before refactoring. |
| CI | None | Add lint + test + build workflow first — it's the safety net for everything above. |

### Known bugs / smells found while surveying (not yet fixed)

- `SamplerController.js`: builds the file path as `instrumentsPath + req.url.substring(23)` — magic offset and **no path sanitization** (`../` traversal risk). Should become `express.static` or a sanitized param route. Also routes `ClassicalPiano` which has no sample directory.
- `DawApiServer.ts`: `SERVER_START_MSG` has an operator-precedence bug — `'🌎 ==>\x1b[0m ' + process.env.hostName === 'localhost'` concatenates before comparing, so the ternary condition is always false.
- `DawApiServer.ts`: `private compiler = webpack(config)` runs unconditionally, so production instantiates a webpack compiler at boot — this is why `webpack`, `webpack-dev-middleware`, etc. sit in `dependencies` instead of `devDependencies`. Lazy-init it inside `setupFrontEnd()` to sever the runtime dependency.
- `webAudioReducer.js` `alert()`s on missing Web Audio support (has a `//TODO: error panel`).
- `webkitAudioContext` fallback can go — every supported browser has unprefixed `AudioContext` now.

### Suggested modernization order

1. CI (lint/test/build) + a few engine unit tests as a safety net.
2. Bundler swap (Vite or Webpack 5) + Node LTS + drop the OpenSSL flag; align `engines` with the Dockerfile.
3. ~~TypeScript 5~~ (done — TS 5.6.3) + ESLint 9/typescript-eslint 8 (still pending).
4. React 18 (`createRoot`, fix `Keyboard.jsx` lifecycles); decide react-bootstrap's fate.
5. Extract audio engine out of Redux state (interface: store holds serializable track/composition descriptors, engine subscribes/exposes an API).
6. Redux Toolkit; rename `stroe.js` → `store.js` along the way.
7. Server cleanup: drop overnightjs + body-parser, fix `SamplerController` path handling.

Each step is independently shippable; don't combine bundler + React + Redux changes in one branch.

## Conventions

- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).

## Gotchas

- `tsconfig.json` has `strict: true` and `strictNullChecks: true`, but `noImplicitAny: false` — an explicit partial opt-out, not an oversight.
- `engines.node` is pinned to `12.16.3`, but the `Dockerfile` actually runs Node 17.5.0 with `NODE_OPTIONS=--openssl-legacy-provider` (needed for Webpack 4 on Node 17+ OpenSSL). Don't "fix" this mismatch without checking both places.
- Controllers under `src/DawApi/controllers/` are a mix of `.ts` and plain `.js` files — this is intentional/legacy, not a build error.
- Env vars in use: `PORT`, `NODE_ENV`, `NODE_HOST`, `SERVER_ONLY`, `REACT_WEBPACK_ENV`, and a lowercase `hostName` — none are documented elsewhere, so check actual usages (`grep`) before assuming behavior.
- No CI is configured (`.github/workflows` does not exist).
- The Redux store file is `src/public/daw/js/stroe.js` (typo is load-bearing — imports reference it). Searching for `store.js` finds nothing.
- Client imports use webpack aliases (`engine/...`, `components/...`, `constants/...`) defined in `src/webpackCfg/defaults.ts` — plain Node/ts-node cannot resolve client modules, and Jest currently has no `moduleNameMapper` for them (client code is effectively untestable until that's added).
