module.exports.isNullOrUndefined = (value) => {
    return typeof(value) === 'undefined' || value === null;
}

module.exports.isNullUndefinedOrEmpty = (value) => {
    return typeof(value) === 'undefined' || value === null || value.length === 0 || (value.constructor === Object && Object.keys(value).length === 0);
}

module.exports.getTrackByIndex = (trackList, index) => {
    for (let i = 0; i < trackList.length; i++){
        if(trackList[i].index === index){
            return trackList[i];
        }
    }
}

module.exports.getRegionsByTrackIndex = (regionsByTrack, index) => {
    for(let i = 0; i < regionsByTrack.length; i++){
        if(regionsByTrack[i].trackIndex === index){
            return regionsByTrack[i].regions;
        }
    }
}

/**
 * Returns corresponding fequency for the MIDI note number
 * @param {*MIDI note number (for 69 frequency is equal to 440.0)} note
 */
module.exports.noteToFrequency = (note) => {
    return Math.pow(2, (note - 69) / 12) * 440.0;
}