# 1. Styling stays plain CSS with design tokens

Date: 2026-08-09

## Status

Accepted. Supersedes the open question in issue #13 ("Try CSS-IN-JS").

## Context

Issue #13 was filed as a spike: try CSS-in-JS. It predates the work that has
happened to this codebase since, and the question has effectively been answered
by that work rather than by an experiment.

Where styling actually stands:

- **23 CSS files, ~164 KB total**, under `src/public/daw/styles/` — one per
  feature area (`Header.css`, `TrackList.css`, `CompositionGrid.css`, …) plus
  `theme.css`, `reset.css` and `Fonts.css`.
- **`theme.css` is a design-token sheet**: ~29 custom properties for surfaces,
  borders, text, accent and state colours, taken from the design comp during the
  2026 dark re-skin. Components reference them as `var(--pq-*)`, so a palette
  change is a one-file edit.
- **Runtime theming already works** through those tokens. `engine/Theme.ts`
  reads `--pq-accent` off `:root` inside the mixer-meter and oscilloscope draw
  loops, so the canvases recolour when the theme is toggled — no JS style
  objects involved.
- **No CSS-in-JS library is installed.** `@types/styled-components` lingered as
  a types-only dependency with no library behind it and was removed in #219.
- **react-bootstrap was dropped**, not replaced by a styled component library:
  `components/Dropdown.jsx` and `components/Modal.jsx` are dependency-free
  replacements styled from `theme.css`.
- **Inline `style={{…}}` survives in 14 files**, mostly for values computed at
  render time (meter heights, region widths and offsets in the composition grid,
  the piano roll's per-note geometry). Those are genuinely dynamic and would
  stay inline — or become CSS custom properties — under any styling approach.

## Decision

Keep plain CSS files plus the `theme.css` token layer. Do not introduce a
CSS-in-JS library.

## Consequences

What this buys:

- The dark re-skin's tokens stay the single source of truth for colour, and
  runtime theme switching keeps working through `var()` and `getComputedStyle`,
  which is the cheapest mechanism available for canvas code that needs the
  current accent colour every frame.
- No runtime styling cost in the audio path. The composition grid and piano roll
  re-render on every playhead tick during playback; a CSS-in-JS runtime that
  serialises and injects styles per render is exactly the wrong overhead to add
  to a UI that shares a thread with a 0.2 s-lookahead scheduler.
- No new dependency, no build-step change, no bundler plugin. Webpack already
  extracts CSS via `mini-css-extract-plugin`.

What it costs, honestly:

- No scoping. Class names are conventional (`pq-` prefix) rather than enforced,
  so collisions are possible and dead CSS is hard to detect.
- No type checking or dead-code elimination for styles.
- Co-location is by filename convention only: `containers/Header.jsx` and
  `styles/Header.css` are related by name, nothing more.

## What would reopen this

- Scoping becoming a real problem — a collision bug, or CSS growing past the
  point where "which file styles this?" is unclear. **CSS Modules** would be the
  first answer, not a runtime CSS-in-JS library: it fixes scoping with a loader
  change and no runtime cost.
- A need for styles that genuinely depend on JS state in ways `var()` cannot
  express. The current dynamic cases (meter heights, grid geometry) do not
  qualify — they are geometry, not theming.
- A move to a component library that brings its own styling runtime.

If any of those land, revisit with a spike on **one** feature area (the channel
strip is a good candidate: self-contained, token-heavy) rather than a wholesale
migration.
