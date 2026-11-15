import { webpackLocalSettings } from './local';
import { webpackProductionSettings } from './prod';
import { workletSettings } from './worklet';
import * as webpack from 'webpack';
// List of allowed environments
type NODE_ENV = 'local' | 'production';

const env = (process.env.NODE_ENV as NODE_ENV) || 'production';
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Two compilers: the app, and the AudioWorklet bundles (see worklet.ts).
const webpackConfig: webpack.Configuration[] = [
    {
        ...{ local: webpackLocalSettings, production: webpackProductionSettings }[env],
        name: 'app',
        mode,
    },
    workletSettings(mode),
];
module.exports = webpackConfig;
