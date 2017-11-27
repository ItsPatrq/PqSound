/**
 * keyNotes - list of all 88 keys to help determine if specific key is black or white
 * 0 - white key, 1 - black key
 */
let keyNotes = [0, 1, 0];
for(let i = 0; i < 7; i++) {
    keyNotes.push(0,1,0,1,0,0,1,0,1,0,1,0)
}
keyNotes.push(0);
module.exports.keyNotes = keyNotes;