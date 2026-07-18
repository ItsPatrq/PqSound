# Graph Report - .  (2026-07-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 823 nodes · 1103 edges · 109 communities (71 shown, 38 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5de3699`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Constants.ts
- devDependencies
- compilerOptions
- DawApiServer.ts
- DawPage
- TrackDetails
- scripts
- controlActions.js
- index.js
- ControlBar
- Keyboard
- trackListActions.js
- Sampler.ts
- TopNavBar
- TrackList
- Sampler
- Track
- Monotron
- isNullOrUndefined
- PqSynth
- MIDIController
- store
- CompositionGrid
- Monotron
- MultiOsc
- MIDIController.ts
- Sound.test.ts
- AudioFiles.js
- dependencies
- stroe.js
- CompositionParser.ts
- keywords
- Instrument
- VolumeSlider
- Main.jsx
- post-commit
- tsconfig.eslint.json
- post-checkout
- TimeBar.tsx
- InstrumentInput.jsx
- SamplerPresets.js
- .eslintrc.js
- file-loader
- html-webpack-plugin
- http-status-codes
- nodemon
- normalize.css
- @overnightjs/core
- @overnightjs/logger
- react-bootstrap
- react-dom
- react-dropzone
- react-loader-spinner
- react-redux
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
- `addTrack()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js
- `addNewPlugin()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js
- `InstrumentInput()` --references--> `Instruments`  [EXTRACTED]
  src/public/daw/js/components/TrackDetails/InstrumentInput.jsx → src/public/daw/js/constants/Constants.ts
- `initInstrumentContext()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js
- `changeTrackInstrument()` --references--> `store`  [EXTRACTED]
  src/public/daw/js/actions/trackListActions.js → src/public/daw/js/stroe.js

## Import Cycles
- None detected.

## Communities (109 total, 38 thin omitted)

### Community 0 - "Constants.ts"
Cohesion: 0.07
Nodes (27): defaultKeyBindings, defaultKeysNames, defaultKeysNamesNoOctaveNumber, keyboardWidths, keyFrequencies, keyNotes, keys, multipler (+19 more)

### Community 1 - "devDependencies"
Cohesion: 0.04
Nodes (47): css-loader, eslint, eslint-config-prettier, eslint-plugin-prettier, eslint-plugin-react, @flydotio/dockerfile, fork-ts-checker-webpack-plugin, jest (+39 more)

### Community 2 - "compilerOptions"
Cohesion: 0.05
Nodes (36): ., ./.eslintrc.js, jest, node_modules/@types, ./src/**/*.test.ts, ./types, webmidi, compileOnSave (+28 more)

### Community 3 - "DawApiServer.ts"
Cohesion: 0.09
Nodes (18): Controller, express, Get, express, DemoController, fs, getInstrument(), getSound() (+10 more)

### Community 4 - "DawPage"
Cohesion: 0.08
Nodes (15): DawFixtures, test, DawPage, compilerOptions, esModuleInterop, module, moduleResolution, skipLibCheck (+7 more)

### Community 6 - "scripts"
Cohesion: 0.09
Nodes (22): author, description, engines, node, license, name, repository, type (+14 more)

### Community 7 - "controlActions.js"
Cohesion: 0.10
Nodes (3): updateCurrentTime(), mockedDispatch, mockedGetState

### Community 8 - "index.js"
Cohesion: 0.13
Nodes (10): BufferLoader, reducer(), reducer(), reducer(), reducer(), firstInstrument, newMasterPluginList, newTrackPluginList (+2 more)

### Community 12 - "Sampler.ts"
Cohesion: 0.23
Nodes (8): Instruments, noteToFrequency(), InstrumentUtils, Utils, InstrumentBase, PqSynthOscillator, Voice, VoiceSynthBase

### Community 15 - "Sampler"
Cohesion: 0.14
Nodes (3): MIDIToNote(), Sampler, SamplerVoice

### Community 18 - "Monotron"
Cohesion: 0.21
Nodes (3): Monotron, Ui(), PanKnob

### Community 22 - "store"
Cohesion: 0.24
Nodes (7): changeTrackInstrument(), initInstrumentContext(), loadTrackState(), getRegionByRegionId(), notesToDrawParser(), Sequencer, store

### Community 26 - "MIDIController.ts"
Cohesion: 0.20
Nodes (3): changeMidiDevice(), addPlayingNote(), removePlayingNote()

### Community 27 - "Sound.test.ts"
Cohesion: 0.23
Nodes (3): SoundOrigin, Sound, mockedGetState

### Community 28 - "AudioFiles.js"
Cohesion: 0.24
Nodes (7): baseConfig, config, localConfig, DSKGrandPiano, keys, RockKit, SlingerlandKit

### Community 29 - "dependencies"
Cohesion: 0.20
Nodes (10): cross-env, npm, dependencies, cross-env, npm, redux-logger, @types/express, webpack (+2 more)

### Community 30 - "stroe.js"
Cohesion: 0.22
Nodes (3): mockedGetState, app, middleware

### Community 31 - "CompositionParser.ts"
Cohesion: 0.31
Nodes (8): getRegionIdByBitIndex(), getRegionsByTrackIndex(), Note, Notes, notesToPlay(), NoteToPlay, Region, regionToDrawParser()

### Community 32 - "keywords"
Cohesion: 0.25
Nodes (8): react, redux, keywords, react, redux, audio, node, synth

### Community 36 - "post-commit"
Cohesion: 0.40
Nodes (4): post-commit script, GRAPHIFY_CHANGED, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 37 - "tsconfig.eslint.json"
Cohesion: 0.40
Nodes (4): ./tsconfig.json, exclude, extends, node_modules

### Community 38 - "post-checkout"
Cohesion: 0.50
Nodes (3): post-checkout script, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 42 - "SamplerPresets.js"
Cohesion: 0.50
Nodes (3): presetList, Presets, Utils

## Knowledge Gaps
- **156 isolated node(s):** `path`, `DawFixtures`, `target`, `module`, `moduleResolution` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `redux` connect `keywords` to `index.js`, `stroe.js`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `keywords` connect `keywords` to `DawApiServer.ts`, `scripts`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `DawApiServer.ts`, `scripts`, `keywords`, `file-loader`, `html-webpack-plugin`, `http-status-codes`, `nodemon`, `normalize.css`, `@overnightjs/core`, `@overnightjs/logger`, `react-bootstrap`, `react-dom`, `react-dropzone`, `react-loader-spinner`, `react-redux`, `redux-thunk`, `ts-node`, `tslib`, `typescript`, `webpack-cli`, `webpack-dev-middleware`, `webpack-hot-middleware`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `path`, `DawFixtures`, `target` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Constants.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06753246753246753 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._