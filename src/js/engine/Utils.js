module.exports.isNullOrUndefined = (value) => {
    return typeof (value) === 'undefined' || value === null;
}

module.exports.isNullUndefinedOrEmpty = (value) => {
    return typeof (value) === 'undefined' || value === null || value.length === 0 || (value.constructor === Object && Object.keys(value).length === 0);
}

module.exports.getTrackByIndex = (trackList, index) => {
    for (let i = 0; i < trackList.length; i++) {
        if (trackList[i].index === index) {
            return trackList[i];
        }
    }
}

module.exports.getRegionsByTrackIndex = (regionsByTrack, index) => {
    for (let i = 0; i < regionsByTrack.length; i++) {
        if (regionsByTrack[i].trackIndex === index) {
            return regionsByTrack[i].regions;
        }
    }
}

module.exports.removeAllFromArray = (array, condition) => {
    let newArray = [...array];
    for (let i = newArray.lengt - 1; i >= 0; i--) {
        if (condition(newArray[i])) {
            newArray.splice(i, 1);
        }
    }
    return newArray;
}

module.exports.removeFirstFromArray = (array, condition) => {
    let newArray = [...array];
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
module.exports.noteToFrequency = (note) => {
    return Math.pow(2, (note - 69) / 12) * 440.0;
}

/**
 * convert note number (0 representing A0, 1 representing A#0...) to MIDI index
 * @param {*note number starting from 0 for A0} note
 */
module.exports.noteToMIDI = (note) => {
    return note + 21;
}

/**
 * convert MIDI note number to note (0 representing A0, 1 representing A#0...)
 * @param {*MIDI note number} note
 */
module.exports.MIDIToNote = (note) => {
    return note - 21;
}

let copy = (data) => {
    if (!(data instanceof AudioContext)) {
        var output, v, key;
        output = Array.isArray(data) ? [] : {};
        for (key in data) {
            v = data[key];
            output[key] = (typeof v === "object") ? copy(v) : v;
        }
        return output;
    } else {
        return null;
    }
}

module.exports.copy = copy;