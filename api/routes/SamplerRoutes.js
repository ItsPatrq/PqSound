'use strict';
module.exports = function (app) {
    const controler = require('../controllers/SamplerController');

    app.route('/api/samplerinstrument/*').get(controler.getInstrument);
};
