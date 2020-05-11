const path = require('path');
module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended' // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    //sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      "jsx": true
    }
  },
  env: {
    browser: true,
    amd: true,
    es6: true,
    node: true,
    mocha: true
  },
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    // "comma-dangle": 1,
    // "quotes": [1, "single"],
    // "no-undef": 1,
    // "global-strict": 0,
    // "no-extra-semi": 1,
    // "no-underscore-dangle": 0,
    // "no-console": 0, //KONSOLA
    // "no-unused-vars": 1,
    // "no-trailing-spaces": [1, { "skipBlankLines": true }],
    // "no-unreachable": 1,
    // "no-alert": 0,
    // "react/jsx-uses-react": 1,
    // "react/jsx-uses-vars": 1
  },
  settings:  {
    react:  {
      version:  'detect',  // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  }
};
