'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

let config = Object.assign({}, baseConfig, {
    entry: [
        'webpack-hot-middleware/client?reload=true',
        path.join(__dirname, '/../src/index')
    ],
    cache: true,
    devtool: 'eval-source-map',
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
        new ExtractTextPlugin('style.css')
    ],
    module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.rules.push(            {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [
        'babel-loader',
    ],
});

module.exports = config;
