# PqSound design re-skin — plan

Full dark-theme DAW re-skin from the Claude Design comp `PqSound.dc.html`, wired
to the live app (real Redux state + Web Audio engine), staged panel by panel.
Design tokens live in `src/public/daw/styles/theme.css` (`--pq-*`). Each stage is
independently shippable — lint + build + in-browser screenshot verify, one commit
per stage (`feat(ui): …`), never combine stages.

Legend: **[engine gap]** = design shows a feature the engine lacks; needs new
plumbing, not just restyle.

---

## DONE

### Stage 1 — shell + header ✅
- `styles/theme.css` (tokens + `.pq-app` dark shell), `styles/Header.css`.
- `containers/Header.jsx` — 56px transport header, **replaces `TopNavBar`** in
  `Layout.jsx`. Real: play/stop via `controlState.sequencer`, BPM/BARS/bar.beat/
  clock from `state.control.sixteenthNotePlaying`+BPM, tools via `changeTool`
  (`Constants.tools` select/draw/remove/copyPaste). Ported alt-key shortcuts,
  keyboard-visibility init, FileUpload/About modals, import/export/demo menu.
- `App.css` body: dropped `padding-top:50px` (old fixed-navbar offset), bg → token.
- Local-only / TODO: record button, LOOP toggle, master OUT meter (no engine backing).

### Stage 2 — tracks panel ✅
- `components/TrackList/Track.jsx` → design lane (name / instrument / vol-bar /
  S·M·R chips + reorder/× micro-icons). `TrackListButtons.jsx` → "TRACKS · N".
  `styles/TrackList.css` dark.
- Wired: select / solo / mute / record / rename / reorder / remove — all real.
- **Row height held at 65px** to stay aligned with CompositionGrid grid lanes
  (grid rows are also 65px — don't change one without the other).
- Verified live (localhost:3001). Only console error = pre-existing
  `EncodingError: Unable to decode audio data` (sample decode, unrelated).

### Stage 3 — ControlBar fold + footer ✅
- Header BPM + BARS now click-to-edit (inline input in `Header.jsx`: `beginEdit`/
  `endEdit`/`commitBPM`/`commitBars`, reuses the `textInputFocusedSwitch` keyboard
  guard; ENTER blurs → commit). `.pq-header-editable`/`.pq-header-edit` in Header.css.
- New `containers/Footer.jsx` + `styles/Footer.css`: 34px status bar — MIDI device
  selector (native dropdown, logic ported from ControlBar), SAMPLES loaded/ready,
  RATE (`context.sampleRate`), RANGE `OCT n–n` (from `keyboard.firstKey`), Keyboard
  toggle (same `updateWidth`+`switchKeyboardVisibility` logic as Header).
- **Sequencer lifecycle moved** ControlBar constructor → `Main.componentDidMount`
  (`new Sequencer(); init(); dispatch(initSequencer())`) — ControlBar was the only
  place it lived. `init()` only sets up the worker, so app-mount timing is safe.
- Deleted `containers/ControlBar.jsx`, `styles/ControlBar.css`, `containers/TopNavBar.jsx`.
  `Layout.jsx`: dropped ControlBar `<Row>`, added `<Footer />` after `<Container>`.
  `Main.jsx`: swapped `ControlBar.css` require → `Footer.css`.
- Verified live (localhost:3001): header BPM 120→140 edit committed; footer renders
  wired (MIDI "not supported" on this browser, RATE 44.1 kHz, RANGE OCT 2–5). Only
  console error = pre-existing `EncodingError` (sample decode). lint + build clean.
- **Note for Stage 4**: under the current bootstrap layout the Footer sits *below* the
  tall keyboard body (pushed under the fold), not pinned to the viewport bottom. The
  grid restructure (rows `56px / 1fr / footer`) fixes this — footer is a grid row then.
- `MIDIDeviceSelector.jsx` now dead (only ControlBar imported it) — left for Stage 13.
- Draw-length / secondary-tool editing → deferred to Stage 6.

---

## TODO

### Stage 4 — Layout grid restructure ✅ (outer shell + FULL inner Col→div teardown DONE)

> 🔧 **FIX 2026-07-27 (post-review):** the "geometry-preserving" teardown below
> preserved a layout that was **already broken** at HEAD. The react-bootstrap
> 0.31→2.10 bump (commit c603cf0) moved cols from bootstrap-3 `float:left` to
> bootstrap-5 flex-only cols — and the two naked col groups (`#ComposingCol` →
> `.trackList` col-2 + `.compositionPanel` col-10; `#TrackDetailsCol` → two
> `.trackDetailsContainer` col-6) have **no `<Row>` wrapper**, so with flex-only
> cols they stacked vertically instead of sitting side-by-side. The teardown's
> "px-identical geometry" verification unknowingly validated that stacked/broken
> state (it even recorded `#ComposingCol` 1918px tall with the panels stacked as
> "the current working layout" — that was the bug). **Fix:** added
> `#ComposingCol, #TrackDetailsCol { display:flex; flex-wrap:wrap; align-items:flex-start; }`
> to `styles/Layout.css` — the flex row the markup never had. Live-verified: trackList
> + compositionPanel now both at y=56 side-by-side, both trackDetails cols at y=56,
> `.pq-body` height 1806→903 (no overflow), keyboard docked. build clean.

Both the CSS-grid app shell + pinned footer AND the full bootstrap Container/Row/Col
teardown are now done (the teardown landed in the "drop bootstrap entirely" pass,
2026-07-27, with live-browser verification). The inner teardown was completed **without**
first doing Stage 11 — the key was a geometry-preserving mechanical conversion (see below)
rather than the redesign the earlier blind attempt tried.

**Inner teardown — DONE (geometry-preserving):** replaced `Container.fluid`/`Row`/`Col`
with dependency-free flex classes in `styles/Layout.css` (`.pq-composer` / `.pq-body` /
`.pq-row` / `.pq-inline-row` / `.pq-col-2|6|10|12`) that reproduce bootstrap 5's exact box
model (`flex:0 0 auto` + `width:<pct>`, a `-12px` row gutter cancelled by `12px` col padding,
`.nopadding` → 0) and — critically — set **no `position`/`transform`**, so the absolutely-
positioned timeline (`.timeBar`/`.svgContainer`/`.compositionRowList`) and the keyboard
overlay (`.keyboard`, `top:100%`) keep the **exact same containing block (`.pq-body-wrap`)
and geometry**. That containing-block invariance is what the earlier blind attempt broke.
Converted JSX: `Layout.jsx` (body + `#TrackDetailsCol`/`#ComposingCol` + `.keyboard`),
`TrackList.jsx` (`.trackList`), `CompositionGrid.jsx` (`.compositionPanel` + `.compositionPanelPianoRoll`),
`TrackDetails.jsx` (two `.trackDetailsContainer`), `VolumeSlider.jsx` (two cols),
`PianoRoll.jsx`/`TimeBar.tsx`/`PianoRollTimeBar.jsx` (`<Row>`→`.pq-inline-row`), `Keyboard.jsx`
(`.keysRow`). **Live-verified in-browser**: before/after DOM geometry identical to the px
(trackDetailsCol 262×903@-12, composingCol 1312×1806, trackList 219, compositionPanel top959,
timeBar abs, keyboard abs `cssTop:893px` offsetParent `.pq-body-wrap`, `bodyScrollH 927 ≈
bodyH 903` = no keyboard overflow), screenshot matches baseline. lint/typecheck/build/jest
55/55/e2e 5/5 all green.

> ✅ **Design column re-arrange — DONE 2026-07-27** (structural pass, live-verified on :3003;
> triggered by user supplying the design comp image + flagging "left/right sidebar fully wrong").
> `.pq-body` is now an explicit 3-track CSS grid `var(--pq-tracks-w=250px) minmax(0,1fr)
> var(--pq-channel-w=300px)` = **tracks rail | timeline | channel**, matching the comp:
> - `Layout.jsx` flattened: dropped `.pq-composer` + the `#TrackDetailsCol`/`#ComposingCol`
>   nesting; children are now `<TrackList/>` (left) / `<CompositionGrid/>` (center) /
>   `.pq-channel-col > <TrackDetails/>` (right). **TrackDetails moved left→right** (it was the
>   mis-placed mixer strips the user saw on the left). Keyboard moved to a direct `.pq-body-wrap`
>   child (its absolute `top:100%`/body-wrap containing block unchanged).
> - **Timeline tangle fixed**: added `position:relative; overflow:hidden` to `.compositionPanel`
>   /`.compositionPanelPianoRoll` so the absolute `.timeBar`/`.svgContainer` (`left:0;right:0`)
>   resolve against the *center cell* instead of `.pq-body-wrap` — no longer spanning full width
>   over the rail + channel. Verified: timeBar x250 clipped to the 1010px center cell.
> - **Keyboard-width regression caught & fixed**: `Keyboard`/`Header`/`Footer` all size the
>   keyboard from `getElementById('ComposingCol').offsetWidth`; flattening removed that id →
>   keyboard collapsed to 1 dead key. Re-added `id="ComposingCol"` to `.pq-body` (full 1560px)
>   → 38 keys render again. **Do not drop that id without repointing all three consumers.**
> - `.pq-body > .{trackList,compositionPanel,compositionPanelPianoRoll,pq-channel-col}` override
>   the leftover bootstrap `.pq-col-%` widths (`width:auto;min-width:0;padding:0`); piano-roll
>   panel gets `grid-column:1/3` (spans rail+center when TrackList renders null in edit view).
> - `TrackDetails.css`: killed dead `#TrackDetailsCol` rule + neutralized the garish teal
>   (`rgb(82,97,102)`/etc) → dark tokens so the right column reads as a channel panel.
> - Verified: bodyCols `250px 1010px 300px`, trackList x0/w250, compPanel x250/w1010 relative,
>   channel x1260/w300, keyboard full-width bottom w1560/38 keys. lint 0-err, typecheck clean,
>   jest 55/55, build:local clean.
>
> ⚠️ **Still TODO after this**: the channel column still holds the OLD `TrackDetails` widgets
> (Master selector / single PanKnob / VolumeSlider), NOT the design's CHANNEL panel (TRACK/MASTER
> tabs, oscilloscope, 5-band EQ, plugin-chain list). That content redesign = **Stage 8** (now
> unblocked — the comp exists). `fxCol` (Stage 9) + `instrumentCol` (Stage 7) grid columns still
> deferred until those panels exist. Keyboard is full-width (not the design's inset 42px) — Stage 11.
> Composition-lanes-below-fold: `.compositionRowList` is now normal-flow inside the relative
> center cell; re-verify with a real region open (empty project this pass).

**Done (outer shell + footer pin):**
- `styles/Layout.css` + `--pq-footer-h: 34px` token. `Layout.jsx` outer div now
  `.pq-shell` = CSS grid `rows: 56px / minmax(0,1fr) / 34px` (header/body/footer),
  `height:100vh; overflow:hidden`. Body wrapped in `.pq-body-wrap` (`overflow:auto`,
  scrolls internally so the keyboard overlay never pushes the footer off-screen).
  **Fixes the Stage-3 "footer under the fold" bug** — footer is now a pinned grid row.
- Retuned child heights `calc(100vh - 100px)`→`- 90px` and `- 134px`→`- 124px`
  across `CompositionGrid.css` / `TrackList.css` / `TrackDetails.css` (old 100 = 50px
  header + 50px controlbar; new chrome = 56 header + 34 footer = 90). `Main.jsx` requires
  `Layout.css`.
- Verified live (localhost:3001): whole app fits one viewport, footer pinned, keyboard
  overlay + footer Keyboard toggle work, timeline ruler intact. lint + build clean; only
  pre-existing `EncodingError` in console.

**✅ RESOLVED (2026-07-27) — the inner teardown below is DONE; kept for the diagnosis history.**
The blind-attempt post-mortem below correctly identified the cause (absolute children +
keyboard `top:100%` resolving against `.pq-body-wrap`); the fix was to preserve that exact
containing-block structure by keeping every replacement `div` `position:static`, rather than
introducing `display:grid`/`position:relative`. Live-DOM measurement confirmed px-identical
geometry. Historical notes:

**(historical) inner `Col`→`div` bootstrap teardown:**
- Live DOM geometry of the current (working) layout (innerH 1049) explains why the blind
  teardown broke: `#ComposingCol` is **1918px tall** — its children `.trackList` (h959,
  top56) and `.compositionPanel` (h959, top1015) **stack vertically**, not side-by-side.
  The side-by-side timeline you SEE is CompositionGrid's *absolutely-positioned* inner
  bits (`.timeBar`/`.compositionRowList`/`.svgContainer`), not the static `.compositionPanel`
  box (which sits below the fold, empty). `.pq-body-wrap` (h959) has `overflow:auto` so the
  1918 row scrolls. `.keyboard` (absolute, h230) resolves its containing block to
  `.pq-body-wrap` (the nearest positioned ancestor — `#ComposingCol` is `position:static`),
  NOT ComposingCol. So a real cols grid must ALSO untangle CompositionGrid's absolute
  positioning and give the keyboard an explicit containing block/height — i.e. do Stage 11
  (keyboard overlay) FIRST, then the grid. Treat this as a manual, measure-as-you-go task.
- ⚠️ **Attempted once & REVERTED** (blind autonomous pass): converting the four `<Col>`
  roots to CSS-grid divs (`.pq-body`/`.pq-composing` `grid-template-columns:212px 1fr`,
  `.pq-channel` 1fr/1fr, `.compositionPanelPianoRoll` `grid-column:1/-1`) *rendered the
  channel + tracks + timeline correctly* BUT regressed the keyboard overlay: `.keyboard`
  (`position:absolute; top:100%`) grew past the viewport, adding a vertical scrollbar +
  overhanging white-key. Root cause = making `.pq-composing` `display:grid` changes the
  implicit-row height that `top:100%` resolves against vs the old bootstrap col. **Next
  attempt must measure `offsetHeight`s live in the browser and pin `.pq-composing` height
  explicitly (or reposition the keyboard, i.e. pull Stage 11 forward) — do NOT re-run the
  same CSS blind.**
- Drop the still-present inner `Container/Row/Col`: convert the four `<Col>` roots to
  grid divs — `Layout.jsx` body (`TrackDetailsCol` xs2 / `ComposingCol` xs10), `TrackList`
  root (`<Col xs2 .trackList>`), `CompositionGrid` roots (`<Col xs10 .compositionPanel>` +
  `<Col xs12 .compositionPanelPianoRoll>`), `TrackDetails` two `<Col xs6 .trackDetailsContainer>`.
  Layout currently relies on bootstrap col %-widths (the panel CSS classes set only height),
  so widths must move into explicit grid tracks when the Cols go.
- Then the design cols `main | fxCol | 300px channel` + center sub-grid
  `tracks(212) | instrumentCol(collapsible) | timeline(1fr)` — **blocked on the panels
  themselves** (fxCol=Stage 9, 300px channel=Stage 8 replacing TrackDetails,
  instrumentCol=Stage 7). Add those grid columns as each panel lands, not before (empty
  cells would just be gaps).
- Panel/view `ui` state (Redux slice or local): side panel (`inst`/`fx`/none), view
  (`arrange`/`edit`/`mix`) — add alongside Stage 6 view bar / Stage 7–9 panels.
- **Keyboard caveat**: `.keyboard` is `position:absolute; top:100%` (bottom overlay). Left
  intact this iteration (body scrolls instead of clipping). Its repositioning into a real
  grid cell is Stage 11.

### Stage 5 — Timeline (arrange view) ✅ (visual reskin; note-dots + loop band deferred)
- Reskinned the arrange-view blocks in `styles/CompositionGrid.css` to theme tokens
  (DOM untouched — no JSX changes, so tool drawing/region actions keep working):
  - Ruler (`.timeBar`/`.timeBarBeat`): `--pq-panel-alt` bg + `--pq-border` bottom, mono
    numerals (`--pq-mono`), weak `--pq-text-faint`, **strong every bar** (`:nth-child(4n+1)`
    → `--pq-text-dim` + 600 weight). Verified on-screen (ruler is visible at top).
  - Lanes (`.trackCompositionRow` 65px `--pq-panel`, `.auxTrackCompositionRow`
    `--pq-panel-alt`) with `--pq-border-soft` separators; bit grid `--pq-border-faint`,
    **stronger bar line** at `:nth-child(4n)` → `--pq-border`.
  - Clips (`.region`/`.region.copied`): `--pq-accent-16` fill + `--pq-accent-55` top/bottom
    bands. `.compositionPanel*` bg → `--pq-inset`.
  - Playhead (`.timePointer` triangle + `.currTimeLine`) → `--pq-accent`.
- lint + build clean. Reskin verified applied via `getComputedStyle` (every class carries
  the token colors). NOTE: lanes/clips could NOT be screenshot-verified — the composition
  lanes (`.compositionRowList`) render at ~y1049, **below the fold**, because they sit off
  the static `.compositionPanel` box (the same absolute-positioning tangle Stage 4's
  deferred teardown fixes). Ruler (top-anchored) confirmed visually; lanes confirmed by
  computed style only. Re-screenshot lanes after Stage 4 teardown lands.
- **Deferred — note-preview dots**: needs `region.notes` plumbed into `TrackCompositionRow`
  (it currently renders empty filled bits, no note data). Add when doing the piano-roll
  note wiring (Stage 6) or as a follow-up.
- **Deferred — loop band**: `[engine gap]` needs a loop range — Stage 12.

### Stage 6 — Piano roll (edit view) ✅ (visual reskin; quantize/view-bar/splitter deferred)
- Reskinned the piano-roll blocks in `styles/CompositionGrid.css` to theme tokens (DOM
  untouched → note-draw/click wiring intact):
  - Note grid rows (`.keyRow` + `.white`/`.black`): dark lanes (`--pq-panel` /
    `--pq-panel-alt`) with layered `repeating-linear-gradient` vertical gridlines —
    faint 16th (`--pq-border-faint` @30px), stronger beat (`--pq-border-soft` @120px),
    strongest bar (`--pq-border` @480px). Replaced the old giant hand-written gray gradients.
  - Key column (`.pianoRollKeyboard` `--pq-inset` + `--pq-border` divider; `.pianoRollKey`
    white → `--pq-control`→`--pq-control-hi` gradient, mono labels `--pq-text-dim`;
    `.pianoRollKey.sharp` black → near-black gradient).
  - Notes (`.note`): `--pq-accent` gradient block, rounded, mono label, accent glow.
  - `.pianoRollTimeBar` already covered by the Stage-5 `.timeBarBeat` reskin.
- lint + build clean. **Verified against the production `dist/style.css`** (old values
  `1e5799`/`#111` gone; `.note` carries `--pq-accent`) — see dev-HMR gotcha below.
- ⚠️ **Dev-HMR staleness gotcha**: the running dev server (webpack-dev-middleware) kept
  serving OLD `.note`/`.pianoRollKey.sharp` CSS even after touch-rebuild + full reloads,
  while other edits in the *same file* updated. Source + `dist` build are correct, so this
  is stale HMR-injected CSS, not a code bug. **Verify CSS via `npm run build:local` + grep
  `dist/assets/style.css`, not only the live dev bundle.** Piano roll also can't be
  screenshot-verified live anyway (needs a region open + it renders below the fold — same
  Stage-4 tangle as timeline lanes).
- **Deferred — quantize buttons (`1/4…1/32`)**: new UI; wire to `noteDrawLength`. Orphaned
  `components/ControlBar/NoteDrawLengthDropdown.jsx` already does this logic — reuse/reskin
  it when the edit-view header exists.
- **Deferred — view bar (`Arrange / Piano Roll / Mixer`)**: new UI, toggles
  `showPianoRoll` (arrange↔edit) + mixer (Stage 10, not built) — build with Stage 10.
- **Deferred — resizable splitter** (design `startResizeEdit`): layout interaction, tied to
  the Stage-4 grid.
- **Deferred — velocity shading**: needs `note.velocity` → opacity/gradient (notes don't
  carry velocity into the `.note` render today). Same class as Stage-5 note-dots.

> 🔒 **Stages 7–10 are BLOCKED for the autonomous loop.** Each builds a NEW side/panel
> container (`InstrumentPanel`/`ChannelPanel`/`FxPanel`/`Mixer`) that must slot into the
> design's CSS-grid cells — but the Stage-4 grid teardown is DEFERRED (needs a manual
> live-DOM session + Stage 11-first, see Stage 4). They also need the design comp
> (`PqSound.dc.html`, NOT saved in the repo) for the knob/wave/strip layouts. The
> editor-recolor slices (`styles/Instruments/*`, `styles/Plugins/*`) could be recolored
> now, but the editors currently live in modals that these panels REPLACE, so recoloring
> them pre-panel is throwaway. **Do not attempt 7–10 autonomously — they need the grid +
> the design comp + human review.** The loop should treat these as blocked and move on.

### Stage 7 — Instrument browser + editor column ✅ DONE 2026-08-01 (functional relocation)
User chose "functional relocation" (comp doesn't show editor internals). New
`containers/InstrumentPanel.jsx` (connected) — an inline collapsible grid column replacing
`InstrumentModal`, gated by the **same `trackDetails.showInstrumentModal` flag** the channel's
instrument-name click already toggles (so no new open/close plumbing).
- Renders `.pq-instrument-col` (returns null when closed): INSTRUMENT header + `×` close
  (dispatch `instrumentModalVisibilitySwitch`), track name + instrument-select `Dropdown`
  (`changeTrackInstrument`), and the editor body — the SAME `Instruments/{Sampler,Monotron,
  MultiOsc,PqSynth}` components the modal used (same switch on `instrument.id`, same props).
  Own handlers mirror TrackDetails' (`handleInstrumentChange`/`handleSamplerPresetChange`
  w/ `fetchSamplerInstrument`/`handleInstrumentPresetChange`).
- `Layout.jsx`: `<InstrumentPanel/>` inserted as the 2nd `.pq-body` child (between rail and
  timeline). `Layout.css` `:has(.pq-instrument-col)` widens the grid to 4 cols
  `250 / 320 / 1fr / 300` when open (default 3-col when the panel renders null). Keyboard width
  unaffected (still measures `#ComposingCol` = whole `.pq-body`).
- `InstrumentInput.jsx`: dropped the `<InstrumentModal/>` render + import (name-click still
  toggles the flag → panel opens). `InstrumentModal.jsx` now **dead** (no importer) — left on
  disk, delete in a cleanup pass.
- Dark-blend recolor of the editor CSS (`styles/Instruments/*`): MultiOsc/Sampler light-gray
  boxes → `--pq-panel-alt`; PqSynth teal osc-tag + `#ccc` section label → dark tokens; Monotron
  was already dark. Knob/slider internals left as-is (functional, not pixel-perfect per the
  chosen scope).
- Live-verified :3003: instrument-name click → grid `250/1010/300` → `250/320/690/300`, INSTRUMENT
  column w320 with the dark MultiOsc editor (osc type / count / detune / attack / release all
  live). lint 0-err, typecheck clean, jest 55/55, build clean.
- **[engine gap] still open**: Sampler per-key custom sample upload (design shows it; engine
  loads server presets only) — not wired.

### Stage 8 — Right channel panel (300px) ✅ DONE 2026-07-29 (EQ live-binding deferred)
Rebuilt `TrackDetails.jsx` render() into the design CHANNEL panel (kept the filename +
all its Redux wiring — no separate `ChannelPanel.jsx`; the whole container already had
every handler). Root is now `<div className="pq-channel">` (single grid child of the
`.pq-channel-col` from Stage 4), replacing the old two stacked `.pq-col-6 trackDetailsContainer`.
- **TRACK / MASTER tab** — local `this.state.tab`; renders one channel (selected track vs
  master index 0). Live-verified: MASTER → name "Master" / "MASTER BUS", OUTPUT row hidden.
- **Oscilloscope** — REAL. New `components/TrackDetails/Oscilloscope.jsx`: canvas + rAF reading
  `track.trackNode.leftAnalyserNode.getByteTimeDomainData()` (Track's existing analyser,
  fftSize 1024, post-pan). Idle track = flat accent mid-line. `key={index}` remounts on
  track/master switch. Cancels rAF in `componentWillUnmount`.
- **Plugin chain** — REAL. Reuses `PluginsList` (add/remove/open-modal wiring intact), restyled.
- **Instrument** — REAL. Reuses `InstrumentInput` (name click → modal, change dropdown), restyled
  inline in the title. `+ Add effect` still opens the existing PluginModal (Stage 9 FX browser
  not built yet).
- **Pan / Volume** — REAL horizontal `<input range>` faders wired to the existing
  `handlePanChange` (−100..100, shows C/Ln/Rn) and `onVolumeChange` (0..200%, shows dB =
  20·log10(vol)). Replaced the old vertical `PanKnob` + `VolumeSlider` (imports dropped).
- **Output** — REAL. Kept `Output` (aux routing) as a compact section for instrument tracks
  (design omits it, but dropping it would lose aux routing).
- **5-band EQ** — ✅ **LIVE-BOUND 2026-08-01** for the 3 real bands. The engine `Equalizer`
  is 3-band, so **LOW/MID/HIGH** are wired to `lowFilterGain`/`midFilterGain`/`highFilterGain`
  and **LO-MID/HI-MID stay disabled** (no engine band). Active only when the shown track has an
  Equalizer in its chain (else label "· no EQ in chain", all disabled). `handleEqChange` maps
  slider 0..200 → linear gain, dispatches partial `changePluginPreset` → reducer `updatePreset`
  (merge + `updateNodes()`). dB label per band = 20·log10(gain). Live-verified: added an
  Equalizer via the chain dropdown → 3 bands enabled @ 0 dB; dragged LOW to gain 2.0 → "+6 dB"
  and the value persisted in state (real preset change). Slider `.pq-eq-slider:disabled` dims.
- CSS: `.pq-channel*` block in `styles/TrackDetails.css` (head/tabs/title/section/scope/eq/
  faders) + re-scoped the reused `.instrumentInputContainer`/`.pluginList`/`.output` under
  `.pq-channel`. Dead old rules (`.trackName`/`.soloMuteButtons`/vertical `.volumeSlider`) left
  in place, now unused (harmless).
- Verified live PORT=3003: channel x=right/w300, TRACK/MASTER toggle, scope canvas, 5 EQ bands,
  2 faders (C / 0.0 dB), PLUGIN CHAIN + OUTPUT. lint 0-err, typecheck clean, jest 55/55, build clean.
- **Debug note:** a stuck "Loading application…" placeholder during verification was **stale
  bundle / browser cache**, NOT a mount crash — a fresh dev restart + new tab mounted cleanly
  (confirmed via a temporary `window.onerror` trap in index.html, since removed). Same
  HMR-staleness class as documented elsewhere.

### Stage 9 — FX browser column ✅ DONE 2026-08-01 (functional relocation)
New `containers/FxPanel.jsx` — inline FX-editor grid column replacing `PluginModal`, gated by
the same `trackDetails.showPluginModal` flag a chain-row click (or add-plugin) already sets.
Same pattern as InstrumentPanel.
- Renders `.pq-fx-col` (null when closed): EFFECT header + `×` close (`pluginModalVisibilitySwitch()`
  no-arg toggle, exactly the old modal onHide), plugin name + track name, and the editor body —
  the SAME `Plugins/{Equalizer,Compressor,Distortion,Delay,Reverb,Chorus}` components the modal
  used (same switch on `plugin.id`, same `onPresetChange` → `changePluginPreset`). Selected plugin
  from `selectedPluginTrackIndex`/`selectedPluginIndex` (mirrors TrackDetails.getSelectedPlugin).
- The plugin "browser" is the existing "Add new plugin" dropdown in the channel PLUGIN CHAIN.
- `Layout.jsx`: `<FxPanel/>` inserted between `<CompositionGrid/>` and the channel column.
  `Layout.css` `:has(.pq-fx-col)` → 4-col `250 / 1fr / 300 / 300`; combined
  `:has(.pq-instrument-col):has(.pq-fx-col)` → 5-col `250 / 320 / 1fr / 300 / 300` (both editors
  open). `.pq-fx-col` reuses the `.pq-inst-head/.pq-inst-title/.pq-inst-editor` styles.
- `TrackDetails.jsx`: dropped `<PluginModal/>` render + import (`PluginModal.jsx` now dead, like
  `InstrumentModal.jsx` — delete both in cleanup).
- Dark-blend recolor of `styles/Plugins/*`: per-effect tints (green Reverb / navy Delay / red
  Distortion) + bright accent borders + Compressor's dark-on-dark text → `--pq-panel-alt` bg,
  `--pq-border` frame, `--pq-text`, `--pq-accent` 2px bands. Knob/slider internals as-is.
- Live-verified :3003: add Reverb → FX column opens, grid `250/710/300/300`, dark editor with
  Sustain/Decay/Reverse/Wet/Dry sliders live. lint 0-err, typecheck clean, jest 55/55, build clean.

### Stage 10 — Mixer (mix view) ✅ DONE 2026-08-01 (functional; splitter deferred)
New `containers/Mixer.jsx` — a strip per track + master, shown as the center view when
`composition.showMixer` (CompositionGrid returns `<Mixer/>` before the arrange/piano-roll
branches). New view state: `showMixer` in `compositionReducer` initial state + action
`switchMixerVisibility(show)` (`SWITCH_MIXER_VISIBILITY`, toggles when payload empty).
- Toggle: new **▤ Mixer** button in the Footer next to ⌨ Keyboard (`toggleMixer` →
  `switchMixerVisibility()`, `is-active` from `composition.showMixer`).
- Each strip: track name, live **2-bar meter** (inner `MixerMeter`, rAF off
  `track.trackNode.getAverageVolume()` {left,right}, /140 scaled), vertical **fader**
  (`changeTrackVolume`), dB readout (20·log10), **pan** slider (`changeTrackPan`, C/Ln/Rn),
  and **S/M/R** (`changeSoloState`/`changeMuteState`/`changeRecordState`, active = warn/accent/
  rec colors). Master strip = accent border, no S/M/R.
- CSS `.pq-mixer` / `.pq-mix-*` appended to `styles/CompositionGrid.css`; `.pq-mixer` fills the
  center grid cell (`calc(100vh - 90px)`, `overflow:auto`) so strips scroll horizontally.
- Live-verified :3003: Mixer toggle → center shows 2 strips (track + Master), faders/meters/
  0.0 dB/pan/SMR, master accent-bordered, footer button lit. lint 0-err, typecheck clean,
  jest 55/55, build clean.
- **Deferred**: resizable splitter (`startResizeMix`) + a proper Arrange/Mixer view-bar (using
  the Footer toggle for now; Stage-6's Arrange/PianoRoll/Mixer bar still deferred).

### Stage 11 — Keyboard overlay reskin ✅ (colours + 42px width DONE)
- Rewrote `styles/Keyboard.css` to the dark theme (JSX untouched → WebMIDI + key-bind
  wiring intact): `.keyboard` `--pq-panel-alt`; `.colorLine` → accent strip w/ glow;
  white keys clean light gradient; black keys dark gradient; **pressed keys → accent**
  (white + black); `.optionKey`/`.disabledKey` dark; `.keyName`/`.keyBind` mono, themed
  per white/black. Replaced the legacy `-webkit-gradient` skeuomorph shadows.
- Verified LIVE on-screen (keyboard is a visible bottom overlay, unlike the below-fold
  timeline/piano-roll): light white keys, dark black keys w/ mono keybind + note labels,
  accent option arrows all render. lint + build clean; dist verified.
- **42px key width ✅ DONE + live-verified** (2026-08-01): the whole key geometry is one
  shared px unit across three places — the `keyboardWidths` table (`Constants.ts`), the CSS
  key widths (`Keyboard.css`), and the `122`/`66` offsets in `Keyboard.jsx`. Scaling every
  constant by the SAME factor `k = 42/66` is a pure horizontal zoom: black/white alignment
  is preserved exactly (mathematically — a linear map can't introduce new misalignment),
  only the physical key shrinks, so more octaves fit the unchanged container width.
  - `Constants.ts`: parametrized the table — `WHITE_KEY_WIDTH = 42`, `KEYBOARD_BASE_OFFSET`
    (= `round(122*k)` = 78), `OCTAVE_WIDTH` (= `round(462*k)` = 294); source octave offsets
    kept as the original 66px numbers, scaled at generation. Killed the magic numbers.
  - `Keyboard.jsx`: imports `WHITE_KEY_WIDTH`/`KEYBOARD_BASE_OFFSET`; replaced the four
    literal `122`s (render budget, `changeKeyboardRange`, `updateDimensions` while-loops) and
    the OptionKeyRight `-66`. `keyboard.width` (= `ComposingCol.offsetWidth`, the container)
    stays UNSCALED — only intrinsic key geometry scales.
  - `Keyboard.css`: white/option/disabled `66→42`, black `36→23`. Heights unchanged (vertical
    layout / footer measurement is independent of key width). Dead `div.flatKeys` margins left
    as-is (blacks position via inline `marginLeft`, not that wrapper).
  - Live-verified (fresh :3003 bundle): whites step exactly 42px (x=41,83,125,167,209); blacks
    land on the correct white boundaries with correct 2-3 grouping (B–C / E–F gaps skipped);
    24/25 blacks flanked both sides (the 1 = rightmost edge sentinel, pre-existing); white
    labels sequential A2→A3; ~5 octaves visible. lint 0-err/7-baseline, typecheck clean,
    jest 55/55, build clean.
  - Keyboard's `position:absolute; top:100%` overlay left intact.

- **FULL design-match: recolor + size/inset + octave-select ✅ DONE + live-verified** (2026-08-01,
  user "unify it" w/ comp image showing dark keys + blue blacks + inset ~2-octave layout):
  - **Recolor** (`Keyboard.css`): white keys light gradient → dark slab (`--pq-control`, thin
    border, rounded bottom); black keys → bright accent-blue (`--pq-accent`) rounded caps w/
    dark labels; pressed white→accent, pressed black→near-white glow; bright accent top-strip →
    1px subtle divider. The comp's "grouped cards" are just the blue blacks bridging
    C-D/D-E/F-G/G-A/A-B while E-F/B-C read as gaps → uniform key row, NO cluster DOM wrappers.
  - **Size**: `WHITE_KEY_WIDTH` 42→**64** (black 38, option/disabled 64). One-line since parametrized.
  - **Inset/centered + decoupled from ComposingCol**: new `KEYBOARD_VIEW_WIDTH` const
    (= `KEYBOARD_VISIBLE_OCTAVES(2)*OCTAVE_WIDTH + KEYBOARD_BASE_OFFSET` = 1014). `keyboard.width`
    is now set to this constant (Keyboard.`updateDimensions`, Header/Footer `toggleKeyboard`) instead
    of `ComposingCol.offsetWidth` — the render/clamp math is unchanged, just fed a fixed width →
    fixed ~2-octave span. `.keyboardBody` `justify-content:space-between` pins the chevrons to the
    edges and centres the key block; `.keysRow` made `position:relative` so the absolute black keys
    resolve against the row and track the centring (alignment holds). OptionKeyRight margin hack removed.
  - **Octave selection refined**: `OptionKeyLeft/Right` collapsed from 4 stacked ±1/±12 chevrons to
    ONE clean tall chevron button per side = shift one octave (±12); footer `RANGE OCT n–n` span
    fixed to `low..low+VISIBLE_OCTAVES`.
  - Live-verified :3003: 15 whites/10 blacks ≈2 octaves; keysRow centred w/ equal 268px margins in a
    1560 body; chevrons at x0/x1496; whites step 64px, blacks on boundaries (A#2/C#3/D#3) aligned;
    octave-up chevron shifted A2→A3, bindings followed (q→A3), footer OCT 2–4→3–5. lint 0-err,
    typecheck, jest 55/55, build all clean. Uncommitted.

### Stage 12 — Engine gaps ✅ (Loop + Record + header-OUT meter DONE; mixer/lane meters + loop-band blocked)
- **Loop** ✅ **DONE + live-verified**:
  - Composition state: `loopEnabled`(false), `loopStart`(0), `loopEnd`(48 bars) in
    `compositionReducer` initial state; actions `switchLoop(enabled)` /
    `changeLoopRange(start,end)` + reducer cases `SWITCH_LOOP` / `CHANGE_LOOP_RANGE`.
    `LOAD_COMPOSITION_STATE` seeds loop defaults for older saved comps.
  - `Sequencer.advenceNote()`: when `loopEnabled`, wraps `sixteenthPlaying` back to
    `loopStart*16` on reaching `loopEnd*16` (noteTime/audio clock keeps marching — only
    the pattern index wraps, gapless).
  - Header LOOP button now backed by `composition.loopEnabled` (dispatches `switchLoop()`);
    removed the old local `loop` state.
  - Verified live (fresh dev bundle): set loop 0–2 bars @240 BPM, played → playhead
    stayed <32 sixteenths and wrapped (max 26 → back to 10). Sequencer unit test 8/8,
    typecheck + lint clean.
  - **Remaining loop bits (deferred)**: timeline loop-band overlay + `LOOP 1–17` label +
    drag-to-set range — UI on the below-fold timeline; needs Stage-4/5 visible lanes.
- **Global record** ✅ **DONE**: header REC button now dispatches
  `changeRecordState(state.tracks.selected)` (`containers/Header.jsx` `toggleRecord`,
  import from `trackListActions`) and its lit state reflects the selected track's `record`
  flag (derived in mapStateToProps: `selected` + `recording`). Removed the old local `rec`
  state. Same reducer path (`CHANGE_RECORD_STATE`) as the per-track R chip (Track.jsx,
  verified Stage 2), so the header arm and lane R chip stay in sync. Recording capture
  itself is the existing flow: `Keyboard.getAllRecordingTracks()` routes note input into
  every track with `record:true` — no new capture plumbing needed. Verified: lint 0-err,
  typecheck clean, `dist` build clean, 55/55 jest. (Non-visual wiring identical to the
  proven R-chip path → no live-gesture check required.)
- **Meters / scope** ✅ **header OUT DONE** (rest blocked): `containers/Header.jsx` runs an
  rAF (`tickMeter`, started in `componentDidMount`, cancelled in `componentWillUnmount`) that
  reads the master track's analyser — `Store.getState().tracks.trackList[0].trackNode
  .getAverageVolume()` (same `{left,right}` reader VolumeSlider uses, proven working) — and
  writes the two OUT bar-fill heights via DOM refs (`outFillRefs`), NOT setState, so the whole
  header doesn't re-render each frame. Level mapped `x/140` clamped 6–100%. Reads the store
  directly (engine pattern) to avoid pulling a non-serializable `trackNode` through
  mapStateToProps. Verified: lint 0-err, typecheck clean, dist build clean, 55/55 jest.
  **Blocked (Stages 8/10):** channel oscilloscope, mixer strip meters, track-lane meters —
  they live inside the panels that need the deferred Stage-4 grid + design comp. The shared
  reader (`Track.getAverageVolume`) is ready for them to consume when those panels land.
- Time signature: keep 4/4 static.

### Stage 13 — Cleanup + tests ✅ (dead-code sweep + Playwright reselect DONE; react-bootstrap drop deferred)
- **Dead code removed**: whole orphaned `components/ControlBar/` subtree (children of the
  Stage-3-deleted `ControlBar` container) — deleted `MIDIDeviceSelector`, `ProjectInfoBox`,
  `BarMeter`, `BarsInCompositionInput`, `BPMInput`, `TimeMeter`, `TimeSignature`,
  `ToolsSelector`, `ToolDropdown`, `RegionDrawLengthInput` (10 files; confirmed zero external
  importers before removal — roots `ProjectInfoBox`/`ToolsSelector`/`MIDIDeviceSelector` had
  none). **Kept `NoteDrawLengthDropdown.jsx`** (now orphaned but preserved for Stage-6 quantize
  reuse per that stage's note). `TopNavBar.jsx`/`ControlBar.jsx` already gone (Stage 3).
- **Kept (still in use):** `InstrumentModal`/`PluginModal`/`AddNewPluginButton` — their
  replacement panels (Stages 7/9) are BLOCKED, so the modals are still the live UI.
- **Playwright reselect DONE**: rewrote `playwright/shared/pageObjects/DawPage.ts` off the old
  Bootstrap navbar/`.controlBar` DOM onto the re-skin Header — `.pq-brand` wordmark, transport
  by `title` (`Play`/`Record`/`Stop`), `.pq-header` for playhead text, `openMenu()` (`···`
  `button[title="Menu"]`) before the now-tucked-away "Load demo". Added stable `.pq-brand` class
  to Header's brand wrapper. Updated `app-loads.spec.ts` (dropped the removed separate Pause
  button; open menu before asserting Load demo).
- **Verified**: lint 0-err/7-baseline-warn, typecheck clean, dist build clean, jest 55/55,
  **e2e 5/5 green** (on a fresh `PORT=3002` server — a stale dev server squatting 3001 served
  an old bundle and failed first; the documented HMR-staleness gotcha, not a selector bug).
  `graphify update .` ran (859 nodes).
- ~~**Deferred — drop `react-bootstrap` dep entirely**~~ ✅ **DONE (2026-07-27)**: dropped
  `react-bootstrap` + `react-bootstrap-icons` from `package.json`, removed the Bootstrap 5 CSS
  CDN from `index.html`. All 28 usages replaced with dependency-free components:
  `components/Icons.jsx` (inline SVG X/chevrons), `components/Dropdown.jsx` (shared, replaces
  all 7 `DropdownButton`s), `components/Modal.jsx` (shared, replaces all 5 modals; static
  backdrop + header-✕ + footer Close + ESC), plain `<button>` for Button/ButtonGroup, native
  `title` for OverlayTrigger/Tooltip, and the `.pq-col/.pq-row` flex classes for the grid
  (see Stage 4). Themed CSS lives in `styles/theme.css` (`.pq-dropdown*`/`.pq-button`/`.pq-modal*`).
  **The feared jest-util lockfile hazard did NOT materialize** — the lockfile now carries
  **jest@30.4.2** (was jest@27 when the hazard was documented), so `jest-util@30` is jest's own
  natural transitive dep; `npm install --legacy-peer-deps` (node 22.23.1) regenerated cleanly,
  removed 29 packages, kept `jest-util`, and `npm ci --legacy-peer-deps` + `npm test` (55/55) pass.
  Live-verified in-browser (dropdown menu, About modal dark-themed, layout intact w/o CDN);
  e2e 5/5. **Update the jest-util memory** — the skew is resolved now that jest is on 30.

---

## Cross-cutting
- Accent theming: design offers 4 accents → optional `ui.accent` → `--pq-accent`.
- Dependency order: **3 → 4** (grid) before 5/7/8/9/10 (slot into grid cells).
  12 (meters/loop) best after 8/10 exist to consume it. 6/11 independent.

## Dev
- Run: `PORT=3001 npm run start:local` (port 3000 taken by another node process — leave it).
