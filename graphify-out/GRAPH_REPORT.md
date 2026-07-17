# Graph Report - .  (2026-07-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 813 nodes · 1095 edges · 102 communities (69 shown, 33 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1035da01`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Constants.ts
- devDependencies
- DawApiServer.ts
- compilerOptions
- DawPage
- TrackDetails
- MIDIController.ts
- store
- ControlBar
- index.js
- Keyboard
- Sampler.ts
- dependencies
- TopNavBar
- TrackList
- Sampler
- stroe.js
- Track
- CompositionParser.ts
- Monotron
- isNullOrUndefined
- PqSynth
- CompositionGrid
- Monotron
- MultiOsc
- package.json
- scripts
- AudioFiles.js
- keywords
- Sequencer
- Instrument
- VolumeSlider
- Main.jsx
- Sound
- tsconfig.eslint.json
- TimeBar.tsx
- InstrumentInput.jsx
- SamplerPresets.js
- .eslintrc.js
- normalize.css
- npm
- @overnightjs/core
- react-bootstrap
- react-dom
- react-redux
- redux-logger
- redux-thunk
- ts-node
- tslib
- typescript
- webpack-cli
- webpack-dev-middleware
- webpack-hot-middleware

## God Nodes (most connected - your core abstractions)
1. `store` - 35 edges
2. `isNullOrUndefined()` - 26 edges
3. `TrackDetails` - 24 edges
4. `compilerOptions` - 23 edges
5. `ControlBar` - 20 edges
6. `Keyboard` - 18 edges
7. `PluginBase` - 17 edges
8. `TopNavBar` - 16 edges
9. `TrackList` - 16 edges
10. `InstrumentBase` - 15 edges

## Surprising Connections (you probably didn't know these)
- `InstrumentInput()` --references--> `Instruments`  [EXTRACTED]
  src/public/daw/js/components/TrackDetails/InstrumentInput.jsx → src/public/daw/js/constants/Constants.ts
- `addTrack()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js
- `initInstrumentContext()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js
- `changeTrackInstrument()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js
- `addNewPlugin()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js

## Import Cycles
- None detected.

## Communities (102 total, 33 thin omitted)

### Community 0 - "Constants.ts"
Cohesion: 0.07
Nodes (27): defaultKeyBindings, defaultKeysNames, defaultKeysNamesNoOctaveNumber, keyboardWidths, keyFrequencies, keyNotes, keys, multipler (+19 more)

### Community 1 - "devDependencies"
Cohesion: 0.04
Nodes (47): css-loader, eslint, eslint-config-prettier, eslint-plugin-prettier, eslint-plugin-react, @flydotio/dockerfile, fork-ts-checker-webpack-plugin, jest (+39 more)

### Community 2 - "DawApiServer.ts"
Cohesion: 0.08
Nodes (19): Controller, express, Get, express, webpack, DemoController, fs, getInstrument() (+11 more)

### Community 3 - "compilerOptions"
Cohesion: 0.05
Nodes (36): ., ./.eslintrc.js, jest, node_modules/@types, ./src/**/*.test.ts, ./types, webmidi, compileOnSave (+28 more)

### Community 4 - "DawPage"
Cohesion: 0.08
Nodes (15): DawFixtures, test, DawPage, compilerOptions, esModuleInterop, module, moduleResolution, skipLibCheck (+7 more)

### Community 6 - "MIDIController.ts"
Cohesion: 0.13
Nodes (5): changeMidiDevice(), updateMidiController(), addPlayingNote(), removePlayingNote(), MIDIController

### Community 7 - "store"
Cohesion: 0.10
Nodes (6): addNewPlugin(), addTrack(), changeTrackInstrument(), initInstrumentContext(), loadTrackState(), store

### Community 9 - "index.js"
Cohesion: 0.13
Nodes (10): BufferLoader, reducer(), reducer(), reducer(), reducer(), firstInstrument, newMasterPluginList, newTrackPluginList (+2 more)

### Community 11 - "Sampler.ts"
Cohesion: 0.23
Nodes (8): Instruments, noteToFrequency(), InstrumentUtils, Utils, InstrumentBase, PqSynthOscillator, Voice, VoiceSynthBase

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): cross-env, file-loader, html-webpack-plugin, http-status-codes, nodemon, @overnightjs/logger, dependencies, cross-env (+11 more)

### Community 15 - "Sampler"
Cohesion: 0.14
Nodes (3): MIDIToNote(), Sampler, SamplerVoice

### Community 16 - "stroe.js"
Cohesion: 0.17
Nodes (6): SoundOrigin, mockedDispatch, mockedGetState, mockedGetState, app, middleware

### Community 20 - "CompositionParser.ts"
Cohesion: 0.17
Nodes (11): getRegionByRegionId(), getRegionIdByBitIndex(), getRegionsByTrackIndex(), Note, Notes, notesToDrawParser(), notesToPlay(), NoteToPlay (+3 more)

### Community 21 - "Monotron"
Cohesion: 0.21
Nodes (3): Monotron, Ui(), PanKnob

### Community 27 - "package.json"
Cohesion: 0.18
Nodes (10): author, description, engines, node, license, name, repository, type (+2 more)

### Community 28 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, build:local, lint, start, start:local, start:local:so, test (+3 more)

### Community 29 - "AudioFiles.js"
Cohesion: 0.24
Nodes (7): baseConfig, config, localConfig, DSKGrandPiano, keys, RockKit, SlingerlandKit

### Community 30 - "keywords"
Cohesion: 0.25
Nodes (8): react, redux, node, keywords, react, redux, audio, synth

### Community 36 - "tsconfig.eslint.json"
Cohesion: 0.40
Nodes (4): ./tsconfig.json, exclude, extends, node_modules

### Community 40 - "SamplerPresets.js"
Cohesion: 0.50
Nodes (3): presetList, Presets, Utils

## Knowledge Gaps
- **155 isolated node(s):** `path`, `name`, `version`, `description`, `start` (+150 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `redux` connect `keywords` to `stroe.js`, `index.js`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Why does `keywords` connect `keywords` to `DawApiServer.ts`, `package.json`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `DawApiServer.ts`, `normalize.css`, `npm`, `@overnightjs/core`, `react-bootstrap`, `react-dom`, `react-redux`, `redux-logger`, `redux-thunk`, `ts-node`, `tslib`, `typescript`, `webpack-cli`, `webpack-dev-middleware`, `webpack-hot-middleware`, `package.json`, `keywords`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `path`, `name`, `version` to the rest of the system?**
  _155 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06753246753246753 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `DawApiServer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08408408408408409 - nodes in this community are weakly interconnected._