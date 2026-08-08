import * as path from 'path';
import type * as webpack from 'webpack';
import { demoRouter } from './controllers/DemoController';
import { getInstrument } from './controllers/SamplerController';
import { Logger } from './logger';
import { rateLimit } from 'express-rate-limit';
import { publicPath } from '../webpackCfg/defaults';
// `import =` rather than a namespace import: express is a callable CommonJS
// export and the project does not enable esModuleInterop.
import express = require('express');
// webpack + dev-middleware are dev-only; they are require()d lazily inside setupFrontEnd()
// so production never loads them (keeps them out of the runtime dependency graph).

export class DawApiServer {
    // `hostName` is set in the deployed environment; both branches read it, so
    // this only distinguishes the literal 'localhost' case for readability.
    private readonly SERVER_START_MSG = '🌎 ==>\x1b[0m ' + (process.env.hostName || 'localhost') + ':';
    public readonly app = express();
    private compiler?: webpack.Compiler;
    private webpackInitialized = false;
    constructor() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use('/api/say-hello', demoRouter);
        this.setupFrontEnd();
        this.setupRoutes();
    }

    private get shouldBuildFront(): boolean {
        return process.env.SERVER_ONLY !== 'true' && process.env.NODE_ENV === 'local';
    }

    private setupRoutes(): void {
        // The sampler endpoint reads files off disk per request; cap how fast a
        // single client can do that. Generous, since loading one instrument
        // fetches ~80 samples at once.
        const samplerLimiter = rateLimit({
            windowMs: 60_000,
            limit: 600,
            standardHeaders: 'draft-7',
            legacyHeaders: false,
        });
        // Express 5 (path-to-regexp v8) requires a *named* wildcard: a bare '*'
        // throws at registration. Until overnightjs was dropped this route ran on
        // the Express 4 app that package created, which is why it worked.
        this.app.route('/api/samplerinstrument/*splat').get(samplerLimiter, getInstrument);
        this.app.use(function (req, res) {
            res.status(404).send({ url: req.originalUrl + ' not found' });
        });
    }

    private setupFrontEnd(): void {
        if (this.shouldBuildFront) {
            Logger.Imp('Starting server in development mode');

            const webpack = require('webpack');

            const config = require('../webpackCfg/webpack.config');

            const webpackMiddleware = require('webpack-dev-middleware');

            const webpackHotMiddleware = require('webpack-hot-middleware');
            this.compiler = webpack(config);
            const middleware = webpackMiddleware(this.compiler, {
                publicPath: publicPath,
                stats: {
                    colors: true,
                    hash: false,
                    timings: true,
                    chunks: false,
                    chunkModules: false,
                    modules: false,
                },
            });

            this.app.use(middleware);
            this.app.use(webpackHotMiddleware(this.compiler));
            this.app.get('/', function response(req, res) {
                res.write(
                    middleware.context.outputFileSystem!.readFileSync!(
                        path.join(__dirname, '../../dist/assets/index.html'),
                    ),
                );
                res.end();
            });
        } else {
            this.app.use(express.static(path.join(__dirname, '../../dist/')));
            this.app.get('/', function response(req, res) {
                res.sendFile(path.join(__dirname, '../../dist/assets/index.html'));
            });
        }
    }

    private startFront(): void {
        if (!this.shouldBuildFront || this.webpackInitialized || !this.compiler) {
            return;
        }
        this.compiler.hooks.done.tap('DawApiServer', () => {
            // Ensures that we log after webpack printed its stats (is there a better way?)
            setTimeout(() => {
                console.log('\n✓ The bundle is now ready for serving! \n');
                console.log(
                    '  \x1b[33mHMR is active\x1b[0m. The bundle will automatically rebuild and live-update on changes.',
                );
            }, 350);
        });
        this.webpackInitialized = true;
    }

    // private setupControllers(): void {
    //     const ctlrInstances = [];
    //     for (const name in controllers) {
    //         if (controllers.hasOwnProperty(name)) {
    //             const Controller = (controllers as any)[name];
    //             ctlrInstances.push(new Controller());
    //         }
    //     }
    //     super.addControllers(ctlrInstances);
    // }

    public start(port: number): void {
        this.startFront();
        this.app.listen(port, (err) => {
            if (err) {
                console.log(err);
            }

            Logger.Imp(this.SERVER_START_MSG + port);
        });
    }
}
