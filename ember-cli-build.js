'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
// eslint-disable-next-line n/no-extraneous-require
const writeFile = require('broccoli-file-creator');
// eslint-disable-next-line n/no-extraneous-require
const MergeTrees = require("broccoli-merge-trees");

const env = EmberApp.env();
const IS_PROD = env === 'production', IS_TEST = env === 'test';

process.on('uncaughtException', function (err) {
  console.error(err.stack);
});

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    babel: {
      loose: true,
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },

    // Don't even generate test files unless a test build
    tests: IS_TEST,

    // Don't store configuration in meta tag
    storeConfigInMeta: false,

    '@embroider/macros': {
      setConfig: {
        'ember-data/store': {
          polyfillUUID: true
        },
      },
    },

    'ember-cli-terser': {
      enabled: IS_PROD,
    },

    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },

    'ember-cli-deprecation-workflow': {
      enabled: true,
    },

    minifyCSS: {
      enabled: false, // minification causes the selectors to be reordered!!
    },

    sassOptions: {
      onlyIncluded: false,
      includePaths: [
        'node_modules/cropperjs/src/css',
        'node_modules/ember-bootstrap/'
      ]
    },

    'ember-bootstrap': {
      bootstrapVersion: 5,
      importBootstrapCSS: false
    },

    autoImport: {
      webpack: {
        module: {
          rules: [
            {
              test: /\.css$/,
              resourceQuery: /raw/,
              type: 'asset/source',
            }
          ]
        },
        resolve: {
          fallback: {
            fs: false
          }
        },
      },
      // Work around for ember-auto-import v2.6 regression & ember-bootstrap
      earlyBootSet: () => [],
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.


  // app.import('node_modules/@okta/okta-signin-widget/dist/css/okta-sign-in.min.css');

  /*
  app.import(`node_modules/dayjs/plugin/advancedFormat.js`);
  app.import(`node_modules/dayjs/plugin/objectSupport.js`);
  app.import(`node_modules/dayjs/plugin/utc.js`);
  app.import(`node_modules/dayjs/plugin/timezone.js`);
  app.import('node_modules/dayjs/plugin/dayOfYear.js');
*/

  app.import('node_modules/@eonasdan/tempus-dominus/dist/css/tempus-dominus.min.css');
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
