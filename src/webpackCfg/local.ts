import { defaultSettings, srcPath } from './defaults';
import * as webpack from 'webpack';
import * as path from 'path';

// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

export const webpackLocalSettings: webpack.Configuration = {
    ...defaultSettings,
    entry: ['webpack-hot-middleware/client?reload=true', path.join(__dirname, '/../public/daw/index')],
    plugins: [
        ...(defaultSettings.plugins as webpack.Plugin[]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('local'),
            'process.env.NODE_HOST': JSON.stringify('local'),
        }),
        new webpack.HotModuleReplacementPlugin(),

        // new HardSourceWebpackPlugin({
        //     // Either an absolute path or relative to webpack's options.context.
        //     cacheDirectory: 'node_modules/.cache/hard-source/[confighash]',
        //     // Either a string of object hash function given a webpack config.
        //     configHash: function(webpackConfig) {
        //       // node-object-hash on npm can be used to build this.
        //       return require('node-object-hash')({sort: false}).hash(webpackConfig);
        //     },
        //     // Either false, a string, an object, or a project hashing function.
        //     environmentHash: {
        //       root: process.cwd(),
        //       directories: [],
        //       files: ['package-lock.json', 'yarn.lock'],
        //     },
        //     // An object.
        //     info: {
        //       // 'none' or 'test'.
        //       mode: 'development',
        //       // 'debug', 'log', 'info', 'warn', or 'error'.
        //       level: 'debug',
        //     },
        //     // Clean up large, old caches automatically.
        //     cachePrune: {
        //       // Caches younger than `maxAge` are not considered for deletion. They must
        //       // be at least this (default: 2 days) old in milliseconds.
        //       maxAge: 2 * 24 * 60 * 60 * 1000,
        //       // All caches together must be larger than `sizeThreshold` before any
        //       // caches will be deleted. Together they must be at least this
        //       // (default: 50 MB) big in bytes.
        //       sizeThreshold: 50 * 1024 * 1024
        //     },
        //   })
    ],
    module: {
        rules: [
            ...(defaultSettings.module as webpack.Module).rules,
            {
                enforce: 'pre',
                test: /\.(js|jsx)$/,
                include: srcPath,
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
        ],
    },
};
