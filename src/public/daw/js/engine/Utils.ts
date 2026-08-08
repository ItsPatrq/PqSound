export const isNullOrUndefined = (value) => {
    return typeof value === 'undefined' || value === null;
};

export const isNullUndefinedOrEmpty = (value) => {
    return (
        typeof value === 'undefined' ||
        value === null ||
        value.length === 0 ||
        (value.constructor === Object && Object.keys(value).length === 0)
    );
};

export const getTrackByIndex = (trackList, index) => {
    for (let i = 0; i < trackList.length; i++) {
        if (trackList[i].index === index) {
            return trackList[i];
        }
    }
};

export const getRegionsByTrackIndex = (regionsByTrack, index) => {
    for (let i = 0; i < regionsByTrack.length; i++) {
        if (regionsByTrack[i].trackIndex === index) {
            return regionsByTrack[i].regions;
        }
    }
};

export const removeAllFromArray = (array, condition) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i >= 0; i--) {
        if (condition(newArray[i])) {
            newArray.splice(i, 1);
        }
    }
    return newArray;
};

/**
 * Returns corresponding fequency for the MIDI note number
 * @param {*MIDI note number (for 69 frequency is equal to 440.0)} note
 */
export const noteToFrequency = (note) => {
    return Math.pow(2, (note - 69) / 12) * 440.0;
};

/**
 * convert note number (0 representing A0, 1 representing A#0...) to MIDI index
 * @param {*note number starting from 0 for A0} note
 */
export const noteToMIDI = (note) => {
    return note + 21;
};

/**
 * convert MIDI note number to note (0 representing A0, 1 representing A#0...)
 * @param {*MIDI note number} note
 */
export const MIDIToNote = (note) => {
    return note - 21;
};

/**
 * Snap a near-centre pan value (float noise around 0) to exactly 0.
 */
export const normalizePan = (pan) => (pan < 0.001 && pan > -0.001 ? 0 : pan);

/**
 * Rounded pan (-100..100) → mixer label: 'C', 'L<n>', 'R<n>'.
 */
export const panLabel = (pan) => {
    const p = Math.round(normalizePan(pan));
    return p === 0 ? 'C' : p < 0 ? 'L' + Math.abs(p) : 'R' + p;
};

/**
 * Linear track volume (0..2) → dB string, '-∞' at/near silence.
 */
export const volumeToDb = (volume) => (volume > 0.0001 ? (20 * Math.log10(volume)).toFixed(1) : '-∞');

/**
 * Deep copy of plain data. Web Audio objects are not copyable, so they come
 * back as null — the check is by constructor name rather than
 * `instanceof AudioContext`, which throws wherever that global is absent
 * (jsdom, node).
 */
export const copy = (data) => {
    if (data === null || typeof data !== 'object') {
        return data;
    }
    if (data.constructor && /^(AudioContext|BaseAudioContext|OfflineAudioContext)$/.test(data.constructor.name)) {
        return null;
    }
    const output = Array.isArray(data) ? [] : {};
    for (const key in data) {
        output[key] = copy(data[key]);
    }
    return output;
};

export const devLog = (msg) => console.warn(msg);
