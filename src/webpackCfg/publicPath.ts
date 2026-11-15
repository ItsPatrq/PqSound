// Where the client bundle is served from. Kept import-free on purpose: the
// production server needs it, and webpackCfg/defaults.ts loads devDependencies
// (mini-css-extract-plugin, html-webpack-plugin) that the Docker image prunes.
export const publicPath = '/assets/';
