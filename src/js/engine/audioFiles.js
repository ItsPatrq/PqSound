'use strict';
let piano = new Array;
let notesInOctave = 12;
let keys = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
for(let i = 0; i < notesInOctave; i++){
    piano.push('http://localhost:3000/api/samplerinstrument/Piano/2' + keys[i] + '.ogg');
}
module.exports.piano = piano;
