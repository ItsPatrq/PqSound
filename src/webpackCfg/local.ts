import { defaultSettings } from './defaults';
import * as webpack from 'webpack';
import * as path from 'path';

export const webpackLocalSettings: webpack.Configuration = {
    ...defaultSettings,
    entry: ['webpack-hot-middleware/client?reload=true', path.join(__dirname, '/../public/daw/index')],
    plugins: [
        ...(defaultSettings.plugins as webpack.WebpackPluginInstance[]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('local'),
            'process.env.NODE_HOST': JSON.stringify('local'),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
};
