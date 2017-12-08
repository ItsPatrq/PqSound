'use strict';
let path = require('path');
let defaultSettings = require('./defaults');


module.exports = {
  node: {
    fs: 'empty'
  },
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'boundle.js',
    publicPath: defaultSettings.publicPath
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      actions: `${defaultSettings.srcPath}/js/actions/`,
      reducers: `${defaultSettings.srcPath}/js/reducers/`,
      components: `${defaultSettings.srcPath}/js/components/`,
      containers: `${defaultSettings.srcPath}/js/containers/`,
      engine: `${defaultSettings.srcPath}/js/engine/`,
      constants: `${defaultSettings.srcPath}/js/constants`,
      instruments: `${defaultSettings.srcPath}/js/instruments`,
      styles: `${defaultSettings.srcPath}/styles/`,
      config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
      'react/lib/ReactMount': 'react-dom/lib/ReactMount'
    }
  },
  module: {}
};
