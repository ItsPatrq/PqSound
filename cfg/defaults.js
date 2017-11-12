/**
 * Function that returns default values.
 * Used because Object.assign does a shallow instead of a deep copy.
 * Using [].push will add to the base array, so a require will alter
 * the base array output.
 */
'use strict';

const path = require('path');
const srcPath = path.join(__dirname, '/../src');

let ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Get the default modules object for webpack
 * @return {Object}
 */
function getDefaultModules() {
    return {
        rules: [
            {            
                enforce: 'pre',            
                test: /\.(js|jsx)$/,
                include: srcPath,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
            {
                test: /\.json?$/,
                loader: 'json'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader',
                }),
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            }
        ]
    };
}

module.exports = {
    srcPath: srcPath,
    publicPath: '/assets/',
    getDefaultModules: getDefaultModules
};
