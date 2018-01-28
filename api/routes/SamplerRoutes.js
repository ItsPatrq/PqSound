'use strict';
module.exports = function (app) {
    var controler = require('../controllers/SamplerController');

    app.route('/api/samplerinstrument/*')
        .get(controler.getInstrument);
};