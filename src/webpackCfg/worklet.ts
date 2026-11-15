import * as path from 'path';
import * as webpack from 'webpack';
import { defaultSettings, srcPath } from './defaults';
import { publicPath } from './publicPath';

/**
 * AudioWorklet bundles. A separate compiler from the app because the worklet
 * global scope has no `self`, `window` or `document`: no HMR runtime, no CSS,
 * no HTML, and webpack's runtime must reach the global through `globalThis`.
 * Output lands next to bundle.js, so it is served from `publicPath` in both
 * the dev middleware and the production static handler.
 */
export const workletSettings = (mode: 'development' | 'production'): webpack.Configuration => ({
    name: 'worklet',
    mode,
    context: defaultSettings.context,
    devtool: mode === 'production' ? false : 'source-map',
    entry: {
        'juno-worklet': path.join(srcPath, 'js/instruments/juno/juno.worklet.ts'),
    },
    output: {
        path: defaultSettings.output!.path,
        filename: '[name].js',
        publicPath,
        globalObject: 'globalThis',
    },
    resolve: defaultSettings.resolve,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: { transpileOnly: true },
            },
        ],
    },
    optimization: { splitChunks: false, runtimeChunk: false },
    cache: true,
});
