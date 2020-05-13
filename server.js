'use strict';
require('core-js/fn/object/assign');

const path = require('path'),
    express = require('express'),
    webpack = require('webpack'),
    webpackMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    config = require('./webpack.config.js'),
    compiler = webpack(config),
    isDeveloping = process.env.NODE_ENV !== 'dist',
    routes = require('./api/routes/SamplerRoutes'),
    port = isDeveloping ? 3000 : process.env.PORT,
    app = express();

/**
 * Flag indicating whether webpack compiled for the first time.
 * @type {boolean}
 */
let isInitialCompilation = true;

if (isDeveloping) {
    const middleware = webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: 'src',
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false,
        },
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));
    app.get('/', function response(req, res) {
        res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/assets/index.html')));
        res.end();
    });
} else {
    app.use(express.static(__dirname + '/dist'));
    app.get('/', function response(req, res) {
        res.sendFile(path.join(__dirname, 'dist/assets/index.html'));
    });
}

routes(app);

app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

app.listen(port, 'localhost', function onStart(err) {
    if (err) {
        console.log(err);
    }
    console.info('==> 🌎 Listening on port %s.', port);
});

compiler.plugin('done', () => {
    if (isInitialCompilation) {
        // Ensures that we log after webpack printed its stats (is there a better way?)
        setTimeout(() => {
            console.log('\n✓ The bundle is now ready for serving!\n');
            console.log('  Open \x1b[33m%s\x1b[0m', 'http://localhost:' + port + '/\n');
            console.log(
                '  \x1b[33mHMR is active\x1b[0m. The bundle will automatically rebuild and live-update on changes.',
            );
        }, 350);
    }
    isInitialCompilation = false;
});
