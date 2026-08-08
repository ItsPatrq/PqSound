'use strict';
const fs = require('fs'),
    path = require('path'),
    // Resolved (no trailing separator) so the containment check below can append
    // exactly one path.sep — appending to a path that already ended in one made
    // the guard reject every legitimate request.
    instrumentsPath = path.resolve(__dirname, '../../../assets/audio/samples/instruments');

const mimeTypes = {
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
    // Named wildcard from '/api/samplerinstrument/*splat', e.g.
    // 'DSKGrandPiano/C4.wav'. Express 5 hands it over as an array of segments.
    const splat = req.params.splat;
    const sound = (Array.isArray(splat) ? splat.join('/') : splat) || '';
    const instrument = sound.substring(0, sound.indexOf('/'));
    const mimeType = mimeTypes[instrument];
    if (!mimeType) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("Instrument '" + instrument + "' not found");
        return;
    }
    // Resolve then confirm the path stays within instrumentsPath (blocks ../ traversal).
    const filePath = path.resolve(instrumentsPath, sound);
    if (!filePath.startsWith(instrumentsPath + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }
    getSound(req, res, filePath, mimeType);
};
