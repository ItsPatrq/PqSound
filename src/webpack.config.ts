import { webpackLocalSettings } from './webpackCfg/local';
import * as webpack from 'webpack';
// List of allowed environments
type NODE_ENV = 'local' | 'prod';


const webpackConfig:webpack.Configuration = {
    "local": webpackLocalSettings
}[process.env.NODE_ENV as NODE_ENV] || {};

module.exports = webpackConfig;