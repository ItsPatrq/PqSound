'use strict';
let pianoSounds = new Array;
let notesInOctave = 12;
let keys = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
for(let i = 0; i < notesInOctave * 1; i++){
    pianoSounds.push('http://localhost:3000/api/samplerinstrument/Piano/2' + keys[i] + '.ogg');
}
module.exports.pianoSounds = pianoSounds;
