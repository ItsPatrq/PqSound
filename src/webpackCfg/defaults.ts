'use strict';
import * as path from 'path';
import * as ExtractTextPlugin from 'extract-text-webpack-plugin';
import * as webpack from 'webpack';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

export const srcPath = path.join(__dirname, './../public/daw/');
export const publicPath = '/assets/';


// Add needed plugins here
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');


export const defaultSettings:webpack.Configuration = {
    node: { fs: 'empty' },
    context: path.join(__dirname, '/../'),
    devtool: 'eval-source-map',
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: 'boundle.js',
        publicPath: publicPath
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            actions: `${srcPath}/js/actions/`,
            reducers: `${srcPath}/js/reducers/`,
            components: `${srcPath}/js/components/`,
            containers: `${srcPath}/js/containers/`,
            engine: `${srcPath}/js/engine/`,
            constants: `${srcPath}/js/constants`,
            instruments: `${srcPath}/js/instruments`,
            plugins: `${srcPath}/js/plugins`,
            styles: `${srcPath}/styles/`,
            config: `${srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
            'react/lib/ReactMount': 'react-dom/lib/ReactMount',
        },
    },
    entry: ['webpack-hot-middleware/client?reload=true', path.join(__dirname, '/../public/daw/index')],
    cache: true,
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '/../public/daw/index.html'),
            inject: 'body',
            filename: 'index.html',
        }),
        new webpack.optimize.OccurrenceOrderPlugin(false),
        new webpack.NoEmitOnErrorsPlugin(),
        new ExtractTextPlugin('style.css'),
        //   new ForkTsCheckerWebpackPlugin({
        //       tsconfig: path.join(__dirname, '/../tsconfig.json')
        //   }) //not working
    ],
    module: {
        rules: [
            {
                test: /\.json?$/,
                loader: 'json',
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader',
                }),
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: ['file-loader'],
            },
            {
                test: /\.(tsx?|jsx?)$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                // options: {
                //     transpileOnly: true // Transpilation is handled by Fork TS Checker Webpack Plugin
                // }
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
            },
        ],
    }
}