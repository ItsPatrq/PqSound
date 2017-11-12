'use strict';
var fs = require('fs'),
    path = require('path'),
    instrumentsPath = path.join(__dirname, '/../../assets/audio/samples/instruments/');

exports.getInstrument = function (req, res) {
    var sound = req.url.substring(23);
    var instrument = sound.substring(0, sound.indexOf('/'));
    var filePath = instrumentsPath + sound;
    if (instrument === 'Piano') {
        getSound(req, res, filePath, 'audio/ogg');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('Instrument \'' + instrument + '\' not found');
        res.end();
    }
};


var getSound = function (req, res, filePath, mimeType) {
    var stats = fs.statSync(filePath);
    fs.readFile(filePath, function (err, data) {
        res.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': stats.size });
        if (err) {
            console.error(err);
        }
        res.write(data);
        res.end();
    });
}