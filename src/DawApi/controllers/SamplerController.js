'use strict';
const fs = require('fs'),
    path = require('path'),
    instrumentsPath = path.join(__dirname, '/../../../assets/audio/samples/instruments/');

const mimeTypes = {
    ClassicalPiano: 'audio/ogg',
    DSKGrandPiano: 'audio/wav',
    SlingerlandKit: 'audio/wav',
    RockKit: 'audio/wav',
};

const getSound = function (req, res, filePath, mimeType) {
    fs.readFile(filePath, function (err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Sound not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': data.length });
        res.end(data);
    });
};

export const getInstrument = function (req, res) {
    // Express wildcard route match, e.g. 'DSKGrandPiano/C4.wav'
    const sound = req.params[0] || '';
    const instrument = sound.substring(0, sound.indexOf('/'));
    const mimeType = mimeTypes[instrument];
    if (!mimeType) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Instrument '" + instrument + "' not found");
        return;
    }
    // Resolve then confirm the path stays within instrumentsPath (blocks ../ traversal).
    const filePath = path.resolve(instrumentsPath, sound);
    if (filePath !== instrumentsPath && !filePath.startsWith(instrumentsPath + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    getSound(req, res, filePath, mimeType);
};
