/**
 * Reads the current `--pq-accent` CSS custom property off :root. Call it inside a
 * draw loop (not once at init) so live canvases — the mixer meters and the channel
 * oscilloscope — recolour when the light/dark theme is toggled at runtime.
 */
export const readAccent = (): string =>
    getComputedStyle(document.documentElement).getPropertyValue('--pq-accent').trim() || '#3fb0e0';
