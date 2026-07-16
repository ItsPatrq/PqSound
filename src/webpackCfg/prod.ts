import { defaultSettings } from './defaults';
import * as webpack from 'webpack';
import * as path from 'path';

export const webpackProductionSettings: webpack.Configuration = {
    ...defaultSettings,
    entry: [path.join(__dirname, '/../public/daw/index')],
    plugins: [
        ...(defaultSettings.plugins as webpack.WebpackPluginInstance[]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.NODE_HOST': JSON.stringify(process.env.NODE_HOST),
        }),
    ],
};
