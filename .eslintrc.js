module.exports = {
  globals: {
    server: true,
  },
  parser: 'babel-eslint',
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'no-console': 'off',
  },
  overrides: [
    // node files
    {
      parser: 'babel-eslint',
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        '.eslintrc.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015,
        ecmaFeatures: {
          legacyDecorators: true
        }
      },
      env: {
        browser: false,
        node: true
      }
    }
  ]
};
