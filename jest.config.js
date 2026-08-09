const path = require('path');

const srcPath = path.join(__dirname, 'src/public/daw');
const styleMock = path.join(__dirname, 'src/__mocks__/styleMock.js');

// Mirrors the webpack aliases in src/webpackCfg/defaults.ts. Without this, any
// client module that imports through an alias (`engine/...`, `actions/...`)
// cannot be required from a test — which is why the engine tests used to reach
// for relative imports only. Keep the two lists in sync.
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Client sources are a mix of .ts/.tsx/.js/.jsx; ts-jest handles all of
    // them (tsconfig has allowJs). The default preset transforms .ts only,
    // which left alias-imported .js slices untransformed.
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {}],
    },
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    moduleNameMapper: {
        '^actions/(.*)$': `${srcPath}/js/actions/$1`,
        '^slices/(.*)$': `${srcPath}/js/slices/$1`,
        '^components/(.*)$': `${srcPath}/js/components/$1`,
        '^containers/(.*)$': `${srcPath}/js/containers/$1`,
        '^engine/(.*)$': `${srcPath}/js/engine/$1`,
        '^constants/(.*)$': `${srcPath}/js/constants/$1`,
        '^instruments/(.*)$': `${srcPath}/js/instruments/$1`,
        '^instruments$': `${srcPath}/js/instruments`,
        '^plugins/(.*)$': `${srcPath}/js/plugins/$1`,
        '^plugins$': `${srcPath}/js/plugins`,
        // Styles are side-effect requires in components; stub them out.
        '^styles/(.*)$': styleMock,
        '\\.(css)$': styleMock,
    },
};
