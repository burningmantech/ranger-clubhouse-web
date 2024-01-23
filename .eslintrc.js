'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    legacyDecorators: true,
    babelOptions: {
      plugins:
        [
          ['@babel/plugin-proposal-decorators', {decoratorsBeforeExport: true}],
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-private-methods'
        ],
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    // 'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
  },

  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './tests/.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
    {
      files: ['**/*.{js,ts}'],
      rules: {
        'ember/no-runloop': 'off'
      }
    },
  ]
};
