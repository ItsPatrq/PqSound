'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

let config = Object.assign({}, baseConfig, {
    entry: [
        'webpack-hot-middleware/client?reload=true',
        path.join(__dirname, '/../src/index')
    ],
    mode: "development",
    devtool: 'inline-source-map',
    cache: true,
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '/../src/index.html'),
            inject: 'body',
            filename: 'index.html'
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new ExtractTextPlugin('style.css'),
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
        //   }),
        //   new ForkTsCheckerWebpackPlugin({
        //       tsconfig: path.join(__dirname, '/../tsconfig.json')
        //   }) //not working
    ],
    module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [
        'babel-loader'
    ]
}, {
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
    // options: {
    //     transpileOnly: true // Transpilation is handled by Fork TS Checker Webpack Plugin
    // }
}, {
    enforce: 'pre',
    test: /\.js$/,
    loader: "source-map-loader"
}
);

module.exports = config;
