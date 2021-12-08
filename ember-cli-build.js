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

    tests: IS_TEST, // Don't even generate test files unless a test build

    storeConfigInMeta: false, // Don't store configuration in meta tag

    'ember-cli-terser': {
      enabled: IS_PROD,
    },

    'ember-cli-babel': {
      includePolyfill: IS_PROD,
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

    sassOptions: {
     // onlyIncluded: true,
      includePaths: [
        'node_modules/cropperjs/src/css',
        'node_modules/bootstrap/scss',
      ]
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.

  app.import('node_modules/jquery-datetimepicker/jquery.datetimepicker.css');
  app.import('node_modules/jquery-datetimepicker/build/jquery.datetimepicker.full.min.js');
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
