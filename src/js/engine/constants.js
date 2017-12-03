/**
 * Module for bookshelf-related utilities.
 * @module Constants
 */

/**
 * array of all 88 keys to help determine if specific key is black (1) or white (0)
 */
let keyNotes = [0, 1, 0];
for (let i = 0; i < 7; i++) {
    keyNotes.push(0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0)
}
keyNotes.push(0);
module.exports.keyNotes = keyNotes;

/**
 * object containing all available note lengths
 */
module.exports.noteLengths = {
    fullNote: { name: '1/1', id: 0 },
    halfNote: { name: '1/2', id: 1 },
    quarterNote: { name: '1/4', id: 2 },
    eighthNote: { name: '1/8', id: 3 },
    sixteenthNote: { name: '1/16', id: 4 }
}

/**
 * object containing all available tools
 */
module.exports.tools = {
    draw: { name: 'Draw', id: 0 },
    select: { name: 'Select', id: 1 },
    remove: { name: 'Remove', id: 2 }
}

module.exports.instruments = {
    sampler: { name: 'Sampler', id: 0 }
}

/**
 * object containing all available sampler instruments
 */
module.exports.samplerInstruments = {
    piano: { name: 'Piano', id: 0 }
}

module.exports.updateActions = {
    solo: 0,
    mute: 1,
    recotd: 2,
    add: 3,
    remove: 4
};