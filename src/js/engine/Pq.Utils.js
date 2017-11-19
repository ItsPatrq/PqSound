module.exports.updateActions = {
    solo: 0,
    mute: 1,
    recotd: 2,
    add: 3,
    remove: 4
};

module.exports.inputType = {
    softwareInstrument: 0,
    audio: 1
};

module.exports.softwareInstruments = {
    sampler: 0
};

module.exports.samplerInstruments = [
    'piano'
]

module.exports.isNullOrUndefined = (value) => {
    return typeof(value) === 'undefined' || value === null;
}

module.exports.isNullUndefinedOrEmpty = (value) => {
    return typeof(value) === 'undefined' || value === null || value.length === 0 || (Object.keys(value).length === 0 && value.constructor === Object);
}