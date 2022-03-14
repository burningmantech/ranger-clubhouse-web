'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const writeFile = require('broccoli-file-creator');
const MergeTrees = require("broccoli-merge-trees");

const env = EmberApp.env();
const IS_PROD = env === 'production', IS_TEST = env === 'test';

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },

    // Don't even generate test files unless a test build
    tests: IS_TEST,

    // Don't store configuration in meta tag
    storeConfigInMeta: false,

    'ember-cli-terser': {
      enabled: IS_PROD,
    },

    'ember-cli-babel': {
      includePolyfill: IS_PROD,
    },

    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },

    autoprefixer: {
      sourcemap: false // Was never helpful
    },

    sourcemaps: {
      enabled: IS_PROD
    },

    fingerprint: {
      enabled: IS_PROD //Asset rewrite will takes more time and fingerprinting can be omitted in development
    },

    minifyCSS: {
      enabled: false, // minification causes the selectors to be reordered!!
    },

    sassOptions: {
      onlyIncluded: false,
      includePaths: [
        'node_modules/cropperjs/src/css',
//        'node_modules/bootstrap/scss',
        'node_modules/ember-bootstrap/'
      ]
    },

    'ember-bootstrap': {
      bootstrapVersion: 5,
      importBootstrapCSS: false
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.

  // app.import('node_modules/@popperjs/core/dist/umd/popper.js', {
  //  type: 'vendor',
  // prepend: true
  //});
  //app.import('node_modules/bootstrap/dist/js/bootstrap.js', {
  // type: 'vendor',
  // prepend: true
  //});

  // app.import('node_modules/@okta/okta-signin-widget/dist/css/okta-sign-in.min.css');

  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  if (!IS_PROD) {
    return app.toTree();
  }

  // Create a buildstamp file to be used by <NewVersionNotify /> in production.
  const config = app.project.config();
  const fileName = config.newVersion.fileName;
  const buildTimestamp = config.APP.buildTimestamp;
  const buildStampFile = writeFile(fileName, buildTimestamp);

  return new MergeTrees([app.toTree(), buildStampFile]);
};
