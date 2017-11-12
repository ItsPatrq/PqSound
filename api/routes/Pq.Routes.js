'use strict';
module.exports = function (app) {
    var controler = require('../controllers/Pq.Controller');

    // todoList Routes
    app.route('/api/samplerinstrument/*')
        .get(controler.getInstrument);
};