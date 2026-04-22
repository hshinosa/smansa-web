import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    js.configs.recommended,
    {
        files: ['resources/js/**/*.{js,jsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                Promise: 'readonly',
                fetch: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                FormData: 'readonly',
                URLSearchParams: 'readonly',
                URL: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                Image: 'readonly',
                performance: 'readonly',
                PerformanceObserver: 'readonly',
                IntersectionObserver: 'readonly',
                MutationObserver: 'readonly',
                ResizeObserver: 'readonly',
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                Buffer: 'readonly',
                route: 'readonly',
                TextDecoder: 'readonly',
                DOMParser: 'readonly',
                logger: 'readonly',
                confirm: 'readonly',
                alert: 'readonly',
                prompt: 'readonly',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'no-console': 'error',
            'no-debugger': 'error',
            'no-alert': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-useless-escape': 'warn',
            'no-async-promise-executor': 'warn',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        files: ['resources/js/Utils/logger.js'],
        rules: {
            'no-console': 'off',
        },
    },
    {
        ignores: [
            'node_modules/',
            'vendor/',
            'public/build/',
            'storage/',
            'bootstrap/cache/',
        ],
    },
];
