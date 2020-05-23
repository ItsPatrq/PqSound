'use strict';
const fs = require('fs'),
    path = require('path'),
    instrumentsPath = path.join(__dirname, '/../../../assets/audio/samples/instruments/');

const getSound = function (req, res, filePath, mimeType) {
    const stats = fs.statSync(filePath);
    fs.readFile(filePath, function (err, data) {
        res.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': stats.size });
        if (err) {
            console.error(err);
        }
        res.write(data);
        res.end();
    });
};

export const getInstrument = function (req, res) {
    const sound = req.url.substring(23);
    const instrument = sound.substring(0, sound.indexOf('/'));
    const filePath = instrumentsPath + sound;
    if (instrument === 'ClassicalPiano') {
        getSound(req, res, filePath, 'audio/ogg');
    } else if (instrument === 'DSKGrandPiano' || instrument === 'SlingerlandKit' || instrument === 'RockKit') {
        getSound(req, res, filePath, 'audio/wav');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write("Instrument '" + instrument + "' not found");
        res.end();
    }
};
