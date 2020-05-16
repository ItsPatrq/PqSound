import * as path from 'path';
import * as bodyParser from 'body-parser';
import { DemoController } from './controllers/DemoController';
import { getInstrument } from './controllers/SamplerController';
import { Server } from '@overnightjs/core';
import { Logger } from '@overnightjs/logger';
import * as webpack from 'webpack';
import * as config from './webpack.config.js';

import * as webpackMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';

export class DemoServer extends Server {
    private readonly SERVER_START_MSG = '==> 🌎 Listening on port ';
    private compiler: webpack.Compiler = webpack(config);
    constructor() {
        super(true);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        super.addControllers(new DemoController());
        this.setupFrontEnd();
        this.setupRoutes();
    }

    private setupRoutes(): void {
        this.app.route('/api/samplerinstrument/*').get(getInstrument);
        this.app.use(function (req, res) {
            res.status(404).send({ url: req.originalUrl + ' not found' });
        });
    }

    private setupFrontEnd(): void {
        if (process.env.NODE_ENV === 'local') {
            Logger.Imp('Starting server in development mode');
            const middleware = webpackMiddleware(this.compiler, {
                publicPath: config.output.publicPath,
                contentBase: 'public/daw',
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
                res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/assets/index.html')));
                res.end();
            });
        } else {
            this.app.use(this.app.static(__dirname + '/dist'));
            this.app.get('/', function response(req, res) {
                res.sendFile(path.join(__dirname, 'dist/assets/index.html'));
            });
        }
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
        this.app.listen(port, 'localhost', (err) => {
            if (err) {
                console.log(err);
            }
            Logger.Imp(this.SERVER_START_MSG + port);
        });
        this.compiler.plugin('done', () => {
            // Ensures that we log after webpack printed its stats (is there a better way?)
            setTimeout(() => {
                console.log('\n✓ The bundle is now ready for serving!\n');
                console.log('  Open \x1b[33m%s\x1b[0m', 'http://localhost:' + port + '/\n');
                console.log(
                    '  \x1b[33mHMR is active\x1b[0m. The bundle will automatically rebuild and live-update on changes.',
                );
            }, 350);
        });
    }
}

export default DemoServer;
