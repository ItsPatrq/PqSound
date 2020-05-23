import * as path from 'path';
import * as bodyParser from 'body-parser';
import { DemoController } from './controllers/DemoController';
import { getInstrument } from './controllers/SamplerController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as webpack from 'webpack';
import * as config from '../webpackCfg/webpack.config';
import { publicPath } from '../webpackCfg/defaults';
import * as express from 'express';
import * as webpackMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';

export class DawApiServer extends Server {
    private readonly SERVER_START_MSG = '🌎 ==>\x1b[0m http://localhost:';
    private compiler: webpack.Compiler = webpack(config);
    private webpackInitialized = false;
    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        super.addControllers(new DemoController());
        this.setupFrontEnd();
        this.setupRoutes();
    }

    private get shouldBuildFront(): boolean {
        return process.env.SERVER_ONLY !== 'true' && process.env.NODE_ENV === 'local';
    }

    private setupRoutes(): void {
        this.app.route('/api/samplerinstrument/*').get(getInstrument);
        this.app.use(function (req, res) {
            res.status(404).send({ url: req.originalUrl + ' not found' });
        });
    }

    private setupFrontEnd(): void {
        if (this.shouldBuildFront) {
            Logger.Imp('Starting server in development mode');
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
                res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../../dist/assets/index.html')));
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
        if (!this.shouldBuildFront || this.webpackInitialized) {
            return;
        }
        this.compiler.plugin('done', () => {
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
        this.app.listen(port, 'localhost', (err) => {
            if (err) {
                console.log(err);
            }

            Logger.Imp(this.SERVER_START_MSG + port);
        });
    }
}
