/**
 * Module for constants variabes and enums
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
 * array of all 88 frequencies for each note starting from a0
 */
let keyFrequencies = [27.50];
let multipler = Math.pow(2, 1 / 12)
for (let i = 1; i < 89; i++) {
    keyFrequencies.push(keyFrequencies[i - 1] * multipler)
}
module.exports.keyFrequencies = keyFrequencies;

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

/**
 * object constaining all available instruments
 */
module.exports.Instruments = {
    Sampler: { name: 'Sampler', id: 0 },
    PqSynth: { name: 'PqSynth', id: 1 },
    Monotron: { name: 'Monotron', id: 2 }
}

module.exports.PluginsEnum = {
    Compresor: { name: 'Compresor', id: 0},
    Equalizer: { name: 'Equalizer', id: 1},
    Distortion: {name: 'Distortion', id: 2}
}

module.exports.Plugins = [
    {
        name: 'Compresor',
        id: 0
    },
    {
        name: 'Equalizer',
        id: 1
    },
    {
        name: 'Distortion',
        id: 2
    }
]

/**
 * enum of update actions
 */
module.exports.updateActions = {
    solo: 0,
    mute: 1,
    recotd: 2,
    add: 3,
    remove: 4
};

/**
 * enum of available track types
 */
module.exports.TrackTypes = {
    virtualInstrument: 0,
    audio: 1,
    aux: 2
}

/**
 * enum for determining how to handle stopping sound
 */
module.exports.SoundOrigin = {
    composition: 0, //Sounds scheduled by sequencer
    pianoRollNote: 1, //Sounds generated by tweaking pianoRoll
    keyboard: 2 //Sounds generated by playing on keyboard
}

/**
 * widths in pixels for every piano key to determine if need to be displayed
 */
let keyboardWidths = [{ sharp: false, startWidth: 0 }, { sharp: true, startWidth: 47 }, { sharp: false, startWidth: 66 }];
let octaveKeysWidth = [{ sharp: false, startWidth: 0 }, { sharp: true, startWidth: 55 }, { sharp: false, startWidth: 66 },
{ sharp: true, startWidth: 123 }, { sharp: false, startWidth: 122 }, { sharp: false, startWidth: 198 },
{ sharp: true, startWidth: 254 }, { sharp: false, startWidth: 264 }, { sharp: true, startWidth: 322 },
{ sharp: false, startWidth: 330 }, { sharp: true, startWidth: 389 }, { sharp: false, startWidth: 396 }]
for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 12; j++) {
        keyboardWidths.push({ sharp: octaveKeysWidth[j].sharp, startWidth: octaveKeysWidth[j].startWidth + 122 + i * 462 });
    }
}
keyboardWidths.push({ sharp: false, startWidth: keyboardWidths[86].startWidth + 66 });
module.exports.keyboardWidths = keyboardWidths;


/**
 * List of strings representing each of 88 notes musical notation for displaying purpose
 */
let keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
let defaultKeysNames = ['A0', 'A#0', 'B0'];
for (let i = 0; i < 7; i++) {
    for (let j = 0; j < keys.length; j++) {
        defaultKeysNames.push(keys[j] + (i + 1).toString());
    }
}
defaultKeysNames.push('C8');
module.exports.defaultKeysNames = defaultKeysNames;

let defaultKeysNamesNoOctaveNumber = ['A', 'A#', 'B'];
for (let i = 0; i < 7; i++) {
    for (let j = 0; j < keys.length; j++) {
        defaultKeysNamesNoOctaveNumber.push(keys[j]);
    }
}
defaultKeysNamesNoOctaveNumber.push('C');

module.exports.defaultKeysNamesNoOctaveNumber = defaultKeysNamesNoOctaveNumber;

module.exports.defaultKeyBindings = [
    { MIDINote: 21, keyboardKey: 'q' },
    { MIDINote: 22, keyboardKey: '2' },
    { MIDINote: 23, keyboardKey: 'w' },
    { MIDINote: 24, keyboardKey: 'e' },
    { MIDINote: 25, keyboardKey: '4' },
    { MIDINote: 26, keyboardKey: 'r' },
    { MIDINote: 27, keyboardKey: '5' },
    { MIDINote: 28, keyboardKey: 't' },
    { MIDINote: 29, keyboardKey: 'y' },
    { MIDINote: 30, keyboardKey: '7' },
    { MIDINote: 31, keyboardKey: 'u' },
    { MIDINote: 32, keyboardKey: '8' },
    { MIDINote: 33, keyboardKey: 'i' },
    { MIDINote: 34, keyboardKey: '9' },
    { MIDINote: 35, keyboardKey: 'o' },
    { MIDINote: 36, keyboardKey: 'z' },
    { MIDINote: 37, keyboardKey: 's' },
    { MIDINote: 38, keyboardKey: 'x' },
    { MIDINote: 39, keyboardKey: 'd' },
    { MIDINote: 40, keyboardKey: 'c' },
    { MIDINote: 41, keyboardKey: 'v' },
    { MIDINote: 42, keyboardKey: 'g' },
    { MIDINote: 43, keyboardKey: 'b' },
    { MIDINote: 44, keyboardKey: 'h' },
    { MIDINote: 45, keyboardKey: 'n' },
    { MIDINote: 46, keyboardKey: 'j' },
    { MIDINote: 47, keyboardKey: 'm' },
    { MIDINote: 48, keyboardKey: ',' },
    { MIDINote: 49, keyboardKey: 'l' },
    { MIDINote: 50, keyboardKey: '.' },
    { MIDINote: 51, keyboardKey: ';' },
    { MIDINote: 52, keyboardKey: '/' }
]

/**
 * base64 icons
 */

 module.exports.pencilIcon='url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUyOC44OTkgNTI4Ljg5OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTI4Ljg5OSA1MjguODk5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTMyOC44ODMsODkuMTI1bDEwNy41OSwxMDcuNTg5bC0yNzIuMzQsMjcyLjM0TDU2LjYwNCwzNjEuNDY1TDMyOC44ODMsODkuMTI1eiBNNTE4LjExMyw2My4xNzdsLTQ3Ljk4MS00Ny45ODEgICBjLTE4LjU0My0xOC41NDMtNDguNjUzLTE4LjU0My02Ny4yNTksMGwtNDUuOTYxLDQ1Ljk2MWwxMDcuNTksMTA3LjU5bDUzLjYxMS01My42MTEgICBDNTMyLjQ5NSwxMDAuNzUzLDUzMi40OTUsNzcuNTU5LDUxOC4xMTMsNjMuMTc3eiBNMC4zLDUxMi42OWMtMS45NTgsOC44MTIsNS45OTgsMTYuNzA4LDE0LjgxMSwxNC41NjVsMTE5Ljg5MS0yOS4wNjkgICBMMjcuNDczLDM5MC41OTdMMC4zLDUxMi42OXoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K)';

 module.exports.eraserIcon='url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDM2MCAzNjAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDM2MCAzNjA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzQ4Ljk5NCwxMDIuOTQ2TDI1MC4wNCwzLjk5M2MtNS4zMjMtNS4zMjMtMTMuOTU0LTUuMzI0LTE5LjI3NywwbC0xNTMuNywxNTMuNzAxbDExOC4yMywxMTguMjNsMTUzLjcwMS0xNTMuNyAgICBDMzU0LjMxNywxMTYuOTAyLDM1NC4zMTcsMTA4LjI3MSwzNDguOTk0LDEwMi45NDZ6IiBmaWxsPSIjMDAwMDAwIi8+CgkJPHBhdGggZD0iTTUyLjY0NiwxODIuMTFsLTQxLjY0LDQxLjY0Yy01LjMyNCw1LjMyMi01LjMyNCwxMy45NTMsMCwxOS4yNzVsOTguOTU0LDk4Ljk1N2M1LjMyMyw1LjMyMiwxMy45NTQsNS4zMiwxOS4yNzcsMCAgICBsNDEuNjM5LTQxLjY0MUw1Mi42NDYsMTgyLjExeiIgZmlsbD0iIzAwMDAwMCIvPgoJCTxwb2x5Z29uIHBvaW50cz0iMTUwLjEzMywzNjAgMzQxLjc2NywzNjAgMzQxLjc2NywzMzEuOTQ5IDE4Mi44MDYsMzMxLjk0OSAgICIgZmlsbD0iIzAwMDAwMCIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)';

 module.exports.copyIcon='url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMS42MjcgNTExLjYyNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjYyNyA1MTEuNjI3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTUwMy42MzMsMTE3LjYyOGMtNS4zMzItNS4zMjctMTEuOC03Ljk5My0xOS40MS03Ljk5M0gzNjUuNDQ2Yy0xMS40MTcsMC0yMy42MDMsMy44MDYtMzYuNTQyLDExLjQyVjI3LjQxMiAgIGMwLTcuNjE2LTIuNjYyLTE0LjA5Mi03Ljk5NC0xOS40MTdDMzE1LjU3OCwyLjY2NiwzMDkuMTEsMCwzMDEuNDkyLDBIMTgyLjcyNWMtNy42MTQsMC0xNS45OSwxLjkwMy0yNS4xMjUsNS43MDggICBjLTkuMTM2LDMuODA2LTE2LjM2OCw4LjM3Ni0yMS43LDEzLjcwNkwxOS40MTQsMTM1LjkwMWMtNS4zMyw1LjMyOS05LjksMTIuNTYzLTEzLjcwNiwyMS42OThDMS45MDMsMTY2LjczOCwwLDE3NS4xMDgsMCwxODIuNzI1ICAgdjE5MS44NThjMCw3LjYxOCwyLjY2MywxNC4wOTMsNy45OTIsMTkuNDE3YzUuMzMsNS4zMzIsMTEuODAzLDcuOTk0LDE5LjQxNCw3Ljk5NGgxNTUuMzE4djgyLjIyOWMwLDcuNjEsMi42NjIsMTQuMDg1LDcuOTkyLDE5LjQxICAgYzUuMzI3LDUuMzMyLDExLjgsNy45OTQsMTkuNDE0LDcuOTk0aDI3NC4wOTFjNy42MSwwLDE0LjA4NS0yLjY2MiwxOS40MS03Ljk5NGM1LjMzMi01LjMyNSw3Ljk5NC0xMS44LDcuOTk0LTE5LjQxVjEzNy4wNDYgICBDNTExLjYyNywxMjkuNDMyLDUwOC45NjUsMTIyLjk1OCw1MDMuNjMzLDExNy42Mjh6IE0zMjguOTA0LDE3MC40NDl2ODUuMzY0aC04NS4zNjZMMzI4LjkwNCwxNzAuNDQ5eiBNMTQ2LjE3OCw2MC44MTN2ODUuMzY0ICAgSDYwLjgxNEwxNDYuMTc4LDYwLjgxM3ogTTIwMi4xMzksMjQ1LjUzNWMtNS4zMyw1LjMzLTkuOSwxMi41NjQtMTMuNzA2LDIxLjcwMWMtMy44MDUsOS4xNDEtNS43MDgsMTcuNTA4LTUuNzA4LDI1LjEyNnY3My4wODMgICBIMzYuNTQ3VjE4Mi43MjVoMTE4Ljc2NmM3LjYxNiwwLDE0LjA4Ny0yLjY2NCwxOS40MTctNy45OTRjNS4zMjctNS4zMyw3Ljk5NC0xMS44MDEsNy45OTQtMTkuNDEyVjM2LjU0N2gxMDkuNjM3djExOC43NzEgICBMMjAyLjEzOSwyNDUuNTM1eiBNNDc1LjA3OCw0NzUuMDg1SDIxOS4yNjNWMjkyLjM1NWgxMTguNzc1YzcuNjE0LDAsMTQuMDgyLTIuNjYyLDE5LjQxLTcuOTk0ICAgYzUuMzI4LTUuMzI1LDcuOTk0LTExLjc5Nyw3Ljk5NC0xOS40MVYxNDYuMTc4aDEwOS42Mjl2MzI4LjkwN0g0NzUuMDc4eiIgZmlsbD0iIzAwMDAwMCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)';

 module.exports.samplerIcon='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYwIDYwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MCA2MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiPgo8Zz4KCTxwYXRoIGQ9Ik00My44NDQsMTMuMDEzbC0xOSwzQzI0LjM1OCwxNi4wODksMjQsMTYuNTA4LDI0LDE3djMuMjg2VjIzdjEzLjY4QzIyLjgzMSwzNS42NDIsMjEuMjQ2LDM1LDE5LjUsMzUgICBjLTMuNTg0LDAtNi41LDIuNjkxLTYuNSw2czIuOTE2LDYsNi41LDZjMy41MzMsMCw2LjQxMS0yLjYxNyw2LjQ5Mi01Ljg2MUMyNS45OTMsNDEuMTI2LDI2LDQxLjExNSwyNiw0MS4xMDJWMjMuODU0bDE3LTIuNjg0ICAgdjkuNTExQzQxLjgzMSwyOS42NDIsNDAuMjQ2LDI5LDM4LjUsMjljLTMuNTg0LDAtNi41LDIuNjkxLTYuNSw2czIuOTE2LDYsNi41LDZzNi41LTIuNjkxLDYuNS02VjIwdi01di0xICAgYzAtMC4yOTItMC4xMjgtMC41Ny0wLjM1MS0wLjc2QzQ0LjQyNywxMy4wNSw0NC4xMzQsMTIuOTY3LDQzLjg0NCwxMy4wMTN6IE0xOS41LDQ1Yy0yLjQ4MSwwLTQuNS0xLjc5NC00LjUtNHMyLjAxOS00LDQuNS00ICAgczQuNSwxLjc5NCw0LjUsNFMyMS45ODEsNDUsMTkuNSw0NXogTTI2LDIxLjgzdi0xLjU0NHYtMi40MzJsMTctMi42ODV2My45NzZMMjYsMjEuODN6IE0zOC41LDM5Yy0yLjQ4MSwwLTQuNS0xLjc5NC00LjUtNCAgIHMyLjAxOS00LDQuNS00czQuNSwxLjc5NCw0LjUsNFM0MC45ODEsMzksMzguNSwzOXoiIGZpbGw9IiMwMDAwMDAiLz4KCTxwYXRoIGQ9Ik02MCwxNGgtNHYtNGgtNFY2SDh2NEg0djRIMHYzMmg0djRoNHY0aDQ0di00aDR2LTRoNFYxNHogTTIsNDRWMTZoMnYyOEgyeiBNNiw0OHYtMlYxNHYtMmgydjM2SDZ6IE01MCw1MkgxMHYtMlYxMFY4aDQwdjIgICB2NDBWNTJ6IE01NCw0OGgtMlYxMmgydjJ2MzJWNDh6IE01OCw0NGgtMlYxNmgyVjQ0eiIgZmlsbD0iIzAwMDAwMCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=';

 module.exports.virtualInstrumentIcon='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDM5MS43NTggMzkxLjc1OCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzkxLjc1OCAzOTEuNzU4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+CjxnPgoJPHBhdGggZD0iTTM3OS41MTUsMTU5LjE1M2gtMzAuNjA2aC0xMi4yNDJoLTYuMTIxaC0xMi4yNDJoLTI0LjQ4NWgtMTIuMjQyaC02LjEyMWgtMTIuMjQyaC0yNC40ODVoLTEyLjI0MmgtNi4xMjFoLTEyLjI0MmgtMzYuNzI3ICAgaC02LjEyMWgtMzYuNzI3aC0xMi4yNDJoLTYuMTIxSDk3LjkzOUg3My40NTVINjEuMjEyaC02LjEyMUg0Mi44NDhIMTIuMjQyVjMwLjYwN2MwLTEwLjEyNCw4LjIzOS0xOC4zNjQsMTguMzY0LTE4LjM2NGgzMzAuNTQ1ICAgYzEwLjEyNCwwLDE4LjM2NCw4LjIzOSwxOC4zNjQsMTguMzY0VjE1OS4xNTN6IE0zNzkuNTE1LDM2MS4xNTNjMCwxMC4xMjQtOC4yMzksMTguMzY0LTE4LjM2NCwxOC4zNjRoLTI0LjQ4NVYyOTMuODJoNi4xMjEgICBjMy4zNjcsMCw2LjEyMS0yLjc1NSw2LjEyMS02LjEyMVYxNjUuMjc0aDMwLjYwNnYxOTUuODc5SDM3OS41MTV6IE0zMzAuNTQ1LDM3OS41MTZoLTQ4Ljk3di04NS42OTdoNi4xMjEgICBjMy4zNjcsMCw2LjEyMS0yLjc1NSw2LjEyMS02LjEyMVYxNjUuMjc0aDI0LjQ4NXYxMjIuNDI0YzAsMy4zNjcsMi43NTUsNi4xMjEsNi4xMjEsNi4xMjFoNi4xMjF2ODUuNjk3SDMzMC41NDV6IE0yNzUuNDU1LDM3OS41MTYgICBoLTQ4Ljk3di04NS42OTdoNi4xMjFjMy4zNjcsMCw2LjEyMS0yLjc1NSw2LjEyMS02LjEyMVYxNjUuMjc0aDI0LjQ4NXYxMjIuNDI0YzAsMy4zNjcsMi43NTUsNi4xMjEsNi4xMjEsNi4xMjFoNi4xMjF2ODUuNjk3ICAgSDI3NS40NTV6IE0yMjAuMzY0LDM3OS41MTZoLTQ4Ljk3VjE2NS4yNzRoMzYuNzI3djEyMi40MjRjMCwzLjM2NywyLjc1NSw2LjEyMSw2LjEyMSw2LjEyMWg2LjEyMUwyMjAuMzY0LDM3OS41MTZMMjIwLjM2NCwzNzkuNTE2ICAgeiBNMTY1LjI3MywzNzkuNTE2aC00OC45N3YtODUuNjk3aDYuMTIxYzMuMzY3LDAsNi4xMjEtMi43NTUsNi4xMjEtNi4xMjFWMTY1LjI3NGgzNi43MjdMMTY1LjI3MywzNzkuNTE2TDE2NS4yNzMsMzc5LjUxNnogICAgTTExMC4xODIsMzc5LjUxNmgtNDguOTd2LTg1LjY5N2g2LjEyMWMzLjM2NywwLDYuMTIxLTIuNzU1LDYuMTIxLTYuMTIxVjE2NS4yNzRoMjQuNDg1djEyMi40MjRjMCwzLjM2NywyLjc1NSw2LjEyMSw2LjEyMSw2LjEyMSAgIGg2LjEyMUwxMTAuMTgyLDM3OS41MTZMMTEwLjE4MiwzNzkuNTE2eiBNNTUuMDkxLDM3OS41MTZIMzAuNjA2Yy0xMC4xMjQsMC0xOC4zNjQtOC4yMzktMTguMzY0LTE4LjM2NFYxNjUuMjc0aDMwLjYwNnYxMjIuNDI0ICAgYzAsMy4zNjcsMi43NTUsNi4xMjEsNi4xMjEsNi4xMjFoNi4xMjF2ODUuNjk3SDU1LjA5MXogTTM2MS4xNTIsMC4wMDFIMzAuNjA2QzEzLjcwNSwwLjAwMSwwLDEzLjcwNiwwLDMwLjYwN3YxMjguNTQ1djE5NS44NzkgICB2Ni4xMjFjMCwxNi45MDEsMTMuNzA1LDMwLjYwNiwzMC42MDYsMzAuNjA2aDYuMTIxaDE4LjM2NGg2LjEyMWg0OC45N2g2LjEyMWg0OC45N2g2LjEyMWg0OC45N2g2LjEyMWg0OC45N2g2LjEyMWg0OC45N2g2LjEyMSAgIGgxOC4zNjRoNi4xMjFjMTYuOTAxLDAsMzAuNjA2LTEzLjcwNSwzMC42MDYtMzAuNjA2di02LjEyMVYxNTkuMTUzVjMwLjYwN0MzOTEuNzU4LDEzLjcwNiwzNzguMDUyLDAuMDAxLDM2MS4xNTIsMC4wMDEgICBMMzYxLjE1MiwwLjAwMXogTTkxLjgxOCw0OC45NzFoMTIuMjQyYzMuMzY3LDAsNi4xMjEtMi43NTUsNi4xMjEtNi4xMjFzLTIuNzU1LTYuMTIxLTYuMTIxLTYuMTIxSDkxLjgxOCAgIGMtMy4zNjcsMC02LjEyMSwyLjc1NS02LjEyMSw2LjEyMVM4OC40NTIsNDguOTcxLDkxLjgxOCw0OC45NzFMOTEuODE4LDQ4Ljk3MXogTTY3LjMzMyw0OC45NzFjMy4zNzksMCw2LjEyMS0yLjc0Miw2LjEyMS02LjEyMSAgIHMtMi43NDItNi4xMjEtNi4xMjEtNi4xMjFjLTMuMzc5LDAtNi4xMjEsMi43NDItNi4xMjEsNi4xMjFTNjMuOTU0LDQ4Ljk3MSw2Ny4zMzMsNDguOTcxTDY3LjMzMyw0OC45NzF6IE00Mi44NDgsNDguOTcxICAgYzMuMzc5LDAsNi4xMjEtMi43NDIsNi4xMjEtNi4xMjFzLTIuNzQyLTYuMTIxLTYuMTIxLTYuMTIxcy02LjEyMSwyLjc0Mi02LjEyMSw2LjEyMVMzOS40Nyw0OC45NzEsNDIuODQ4LDQ4Ljk3MUw0Mi44NDgsNDguOTcxeiAgICBNMzE4LjMwMywzOS43ODljMC0xLjY4OS0xLjM3MS0zLjA2MS0zLjA2MS0zLjA2MXMtMy4wNjEsMS4zNzEtMy4wNjEsMy4wNjF2MzkuNzg4aC02LjEyMXYxMi4yNDJoNi4xMjF2MzkuNzg4ICAgYzAsMS42ODksMS4zNzEsMy4wNjEsMy4wNjEsMy4wNjFzMy4wNjEtMS4zNzEsMy4wNjEtMy4wNjFWOTEuODE5aDYuMTIxVjc5LjU3N2gtNi4xMjFWMzkuNzg5eiBNMzU1LjAzLDM5Ljc4OSAgIGMwLTEuNjg5LTEuMzcxLTMuMDYxLTMuMDYxLTMuMDYxcy0zLjA2MSwxLjM3MS0zLjA2MSwzLjA2MXYzOS43ODhoLTYuMTIxdjEyLjI0Mmg2LjEyMXYzOS43ODhjMCwxLjY4OSwxLjM3MSwzLjA2MSwzLjA2MSwzLjA2MSAgIHMzLjA2MS0xLjM3MSwzLjA2MS0zLjA2MVY5MS44MTloNi4xMjFWNzkuNTc3aC02LjEyMVYzOS43ODl6IE0yNDcuOTA5LDExNi4zMDRIMjYyLjljLTEuNDIsNi45NzgtNy42MDMsMTIuMjQyLTE0Ljk5MSwxMi4yNDIgICBjLTguNDM1LDAtMTUuMzAzLTYuODY4LTE1LjMwMy0xNS4zMDNzNi44NjgtMTUuMzAzLDE1LjMwMy0xNS4zMDNjNy4zODgsMCwxMy41NzEsNS4yNjQsMTQuOTkxLDEyLjI0MmgtMTQuOTkxICAgYy0xLjY4OSwwLTMuMDYxLDEuMzcxLTMuMDYxLDMuMDYxUzI0Ni4yMiwxMTYuMzA0LDI0Ny45MDksMTE2LjMwNEwyNDcuOTA5LDExNi4zMDR6IE0yNDcuOTA5LDkxLjgxOSAgIGMtMTEuODMyLDAtMjEuNDI0LDkuNTkyLTIxLjQyNCwyMS40MjRzOS41OTIsMjEuNDI0LDIxLjQyNCwyMS40MjRzMjEuNDI0LTkuNTkyLDIxLjQyNC0yMS40MjRTMjU5Ljc0MSw5MS44MTksMjQ3LjkwOSw5MS44MTkgICBMMjQ3LjkwOSw5MS44MTl6IE0xOTIuODE4LDExNi4zMDRoMTQuOTkxYy0xLjQyLDYuOTc4LTcuNjAzLDEyLjI0Mi0xNC45OTEsMTIuMjQyYy04LjQzNSwwLTE1LjMwMy02Ljg2OC0xNS4zMDMtMTUuMzAzICAgczYuODY4LTE1LjMwMywxNS4zMDMtMTUuMzAzYzcuMzg4LDAsMTMuNTcxLDUuMjY0LDE0Ljk5MSwxMi4yNDJoLTE0Ljk5MWMtMS42ODksMC0zLjA2MSwxLjM3MS0zLjA2MSwzLjA2MSAgIFMxOTEuMTI5LDExNi4zMDQsMTkyLjgxOCwxMTYuMzA0TDE5Mi44MTgsMTE2LjMwNHogTTE5Mi44MTgsOTEuODE5Yy0xMS44MzIsMC0yMS40MjQsOS41OTItMjEuNDI0LDIxLjQyNCAgIHM5LjU5MiwyMS40MjQsMjEuNDI0LDIxLjQyNHMyMS40MjQtOS41OTIsMjEuNDI0LTIxLjQyNFMyMDQuNjUsOTEuODE5LDE5Mi44MTgsOTEuODE5TDE5Mi44MTgsOTEuODE5eiBNMjUwLjk3LDczLjE0M3YtMTQuOTkgICBjMC0xLjY4OS0xLjM3MS0zLjA2MS0zLjA2MS0zLjA2MWMtMS42ODksMC0zLjA2MSwxLjM3MS0zLjA2MSwzLjA2MXYxNC45OTFjLTYuOTc4LTEuNDItMTIuMjQyLTcuNjAzLTEyLjI0Mi0xNC45OTEgICBjMC04LjQzNSw2Ljg2OC0xNS4zMDMsMTUuMzAzLTE1LjMwM2M4LjQzNSwwLDE1LjMwMyw2Ljg2OCwxNS4zMDMsMTUuMzAzQzI2My4yMTIsNjUuNTQxLDI1Ny45NDgsNzEuNzIzLDI1MC45Nyw3My4xNDMgICBMMjUwLjk3LDczLjE0M3ogTTI0Ny45MDksMzYuNzI4Yy0xMS44MzIsMC0yMS40MjQsOS41OTItMjEuNDI0LDIxLjQyNHM5LjU5MiwyMS40MjQsMjEuNDI0LDIxLjQyNHMyMS40MjQtOS41OTIsMjEuNDI0LTIxLjQyNCAgIFMyNTkuNzQxLDM2LjcyOCwyNDcuOTA5LDM2LjcyOEwyNDcuOTA5LDM2LjcyOHogTTEyOC41NDUsMTIyLjQyNWMwLDMuMzczLTIuNzQ4LDYuMTIxLTYuMTIxLDYuMTIxSDQ4Ljk3ICAgYy0zLjM3MywwLTYuMTIxLTIuNzQ4LTYuMTIxLTYuMTIxdi00OC45N2MwLTMuMzczLDIuNzQ4LTYuMTIxLDYuMTIxLTYuMTIxaDczLjQ1NWMzLjM3MywwLDYuMTIxLDIuNzQ4LDYuMTIxLDYuMTIxdjQ4Ljk3SDEyOC41NDV6ICAgIE0xMjIuNDI0LDYxLjIxM0g0OC45N2MtNi43NjQsMC0xMi4yNDIsNS40NzgtMTIuMjQyLDEyLjI0MnY0OC45N2MwLDYuNzY0LDUuNDc4LDEyLjI0MiwxMi4yNDIsMTIuMjQyaDczLjQ1NSAgIGM2Ljc2NCwwLDEyLjI0Mi01LjQ3OCwxMi4yNDItMTIuMjQydi00OC45N0MxMzQuNjY3LDY2LjY5MiwxMjkuMTg4LDYxLjIxMywxMjIuNDI0LDYxLjIxM0wxMjIuNDI0LDYxLjIxM3ogTTE5Mi44MTgsNzMuNDU2ICAgYy04LjQzNSwwLTE1LjMwMy02Ljg2OC0xNS4zMDMtMTUuMzAzYzAtNy4zODgsNS4yNjQtMTMuNTcxLDEyLjI0Mi0xNC45OTF2MTQuOTkxYzAsMS42ODksMS4zNzEsMy4wNjEsMy4wNjEsMy4wNjEgICBjMS42ODksMCwzLjA2MS0xLjM3MSwzLjA2MS0zLjA2MVY0My4xNjJjNi45NzgsMS40MiwxMi4yNDIsNy42MDMsMTIuMjQyLDE0Ljk5MUMyMDguMTIxLDY2LjU4OCwyMDEuMjUzLDczLjQ1NiwxOTIuODE4LDczLjQ1NiAgIEwxOTIuODE4LDczLjQ1NnogTTE5Mi44MTgsMzYuNzI4Yy0xMS44MzIsMC0yMS40MjQsOS41OTItMjEuNDI0LDIxLjQyNHM5LjU5MiwyMS40MjQsMjEuNDI0LDIxLjQyNHMyMS40MjQtOS41OTIsMjEuNDI0LTIxLjQyNCAgIFMyMDQuNjUsMzYuNzI4LDE5Mi44MTgsMzYuNzI4TDE5Mi44MTgsMzYuNzI4eiIgZmlsbD0iIzAwMDAwMCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=';

 module.exports.auxIcon='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDYwIDYwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA2MCA2MDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiPgo8Zz4KCTxwYXRoIGQ9Ik01OSwwSDFDMC40NDgsMCwwLDAuNDQ3LDAsMXY1OGMwLDAuNTUzLDAuNDQ4LDEsMSwxaDU4YzAuNTUyLDAsMS0wLjQ0NywxLTFWMUM2MCwwLjQ0Nyw1OS41NTIsMCw1OSwweiBNNTgsNThIMlYyaDU2VjU4eiIgZmlsbD0iIzAwMDAwMCIvPgoJPHBhdGggZD0iTTYsNTFoNHYzYzAsMC41NTMsMC40NDgsMSwxLDFzMS0wLjQ0NywxLTF2LTNoNGMwLjU1MiwwLDEtMC40NDcsMS0xVjM4YzAtMC41NTMtMC40NDgtMS0xLTFoLTRWNmMwLTAuNTUzLTAuNDQ4LTEtMS0xICAgcy0xLDAuNDQ3LTEsMXYzMUg2Yy0wLjU1MiwwLTEsMC40NDctMSwxdjEyQzUsNTAuNTUzLDUuNDQ4LDUxLDYsNTF6IE03LDM5aDh2MTBIN1YzOXoiIGZpbGw9IiMwMDAwMDAiLz4KCTxwYXRoIGQ9Ik0yNSwzN2g0djE3YzAsMC41NTMsMC40NDgsMSwxLDFzMS0wLjQ0NywxLTFWMzdoNGMwLjU1MiwwLDEtMC40NDcsMS0xVjI0YzAtMC41NTMtMC40NDgtMS0xLTFoLTRWNmMwLTAuNTUzLTAuNDQ4LTEtMS0xICAgcy0xLDAuNDQ3LTEsMXYxN2gtNGMtMC41NTIsMC0xLDAuNDQ3LTEsMXYxMkMyNCwzNi41NTMsMjQuNDQ4LDM3LDI1LDM3eiBNMjYsMjVoOHYxMGgtOFYyNXoiIGZpbGw9IiMwMDAwMDAiLz4KCTxwYXRoIGQ9Ik00NCwyM2g0djMxYzAsMC41NTMsMC40NDgsMSwxLDFzMS0wLjQ0NywxLTFWMjNoNGMwLjU1MiwwLDEtMC40NDcsMS0xVjEwYzAtMC41NTMtMC40NDgtMS0xLTFoLTRWNmMwLTAuNTUzLTAuNDQ4LTEtMS0xICAgcy0xLDAuNDQ3LTEsMXYzaC00Yy0wLjU1MiwwLTEsMC40NDctMSwxdjEyQzQzLDIyLjU1Myw0My40NDgsMjMsNDQsMjN6IE00NSwxMWg4djEwaC04VjExeiIgZmlsbD0iIzAwMDAwMCIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=';
