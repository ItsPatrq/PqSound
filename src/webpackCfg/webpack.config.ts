import { webpackLocalSettings } from './local';
import { webpackProductionSettings } from './prod';
import * as webpack from 'webpack';
// List of allowed environments
type NODE_ENV = 'local' | 'production';

const webpackConfig: webpack.Configuration =
    {
        local: webpackLocalSettings,
        production: webpackProductionSettings,
    }[process.env.NODE_ENV as NODE_ENV] || {};

module.exports = webpackConfig;
module.exports.mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
