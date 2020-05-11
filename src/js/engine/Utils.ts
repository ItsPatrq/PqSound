export const isNullOrUndefined = (value) => {
    return typeof (value) === 'undefined' || value === null;
}

export const isNullUndefinedOrEmpty = (value) => {
    return typeof (value) === 'undefined' || value === null || value.length === 0 || (value.constructor === Object && Object.keys(value).length === 0);
}

export const getTrackByIndex = (trackList, index) => {
    for (let i = 0; i < trackList.length; i++) {
        if (trackList[i].index === index) {
            return trackList[i];
        }
    }
}

export const getRegionsByTrackIndex = (regionsByTrack, index) => {
    for (let i = 0; i < regionsByTrack.length; i++) {
        if (regionsByTrack[i].trackIndex === index) {
            return regionsByTrack[i].regions;
        }
    }
}

export const removeAllFromArray = (array, condition) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i >= 0; i--) {
        if (condition(newArray[i])) {
            newArray.splice(i, 1);
        }
    }
    return newArray;
}

export const removeFirstFromArray = (array, condition) => {
    const newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
        if (condition(newArray[i], i)) {
            newArray.splice(i, 1);
            break;
        }
    }
    return newArray;
}

/**
 * Returns corresponding fequency for the MIDI note number
 * @param {*MIDI note number (for 69 frequency is equal to 440.0)} note
 */
export const noteToFrequency = (note) => {
    return Math.pow(2, (note - 69) / 12) * 440.0;
}

/**
 * convert note number (0 representing A0, 1 representing A#0...) to MIDI index
 * @param {*note number starting from 0 for A0} note
 */
export const noteToMIDI = (note) => {
    return note + 21;
}

/**
 * convert MIDI note number to note (0 representing A0, 1 representing A#0...)
 * @param {*MIDI note number} note
 */
export const MIDIToNote = (note) => {
    return note - 21;
}

export const copy = (data) => {
    if (!(data instanceof AudioContext)) {
        let v, key;
        const output = Array.isArray(data) ? [] : {};
        for (key in data) {
            v = data[key];
            output[key] = (typeof v === 'object') ? copy(v) : v;
        }
        return output;
    } else {
        return null;
    }
}


export const devLog = msg => console.warn(msg);