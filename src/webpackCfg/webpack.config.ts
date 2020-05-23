import { webpackLocalSettings } from './local';
import { webpackProductionSettings } from './prod';
import * as webpack from 'webpack';
// List of allowed environments
type NODE_ENV = 'local' | 'prod';

const webpackConfig: webpack.Configuration =
    {
        local: webpackLocalSettings,
        prod: webpackProductionSettings,
    }[process.env.NODE_ENV as NODE_ENV] || {};

module.exports = webpackConfig;
module.exports.mode = process.env.NODE_ENV === 'prod' ? 'production' : 'development';
console.log(module.exports.output);
