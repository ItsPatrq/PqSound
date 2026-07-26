const globals = require('globals');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// Flat config (ESLint 9/10). Replaces the old .eslintrc.js + --ext/--ignore-path
// CLI flags (removed in ESLint 9+). Prettier still runs through
// eslint-plugin-prettier, so `npm run lint` remains the single formatter.
module.exports = tseslint.config(
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'graphify-out/**',
            'playwright/report/**',
            'playwright/test-results/**',
            'coverage/**',
        ],
    },
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                ...globals.amd,
            },
        },
        plugins: {
            react: reactPlugin,
        },
        settings: {
            // Pinned (not 'detect') because eslint-plugin-react's version
            // detection calls the removed context.getFilename() on ESLint 10.
            react: { version: '16.14.0' },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            'react/prop-types': 'off',
            // The app requires CSS via require() and uses `import x = require()`.
            '@typescript-eslint/no-require-imports': 'off',
            // The ~2020 stack carries many explicit/implicit anys (noImplicitAny: false).
            '@typescript-eslint/no-explicit-any': 'off',
            // Keep the pre-existing "warnings don't fail the build" posture.
            '@typescript-eslint/no-unused-vars': 'warn',
            // Allow the `x || (x = default)` lazy-init idiom used in the vendored Knob lib.
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
        },
    },
    prettierRecommended,
);
