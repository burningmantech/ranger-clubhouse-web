'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    'ember-cli-uglify': {
      uglify: {
        mangle: false
      }
    },

    'ember-cli-babel': {
      includePolyfill: true
    },

    sassOptions: {
      onlyIncluded: true,
      includePaths: [
      'node_modules/cropperjs/src/css'
    ]

    },

    // Create a /VERSION.txt to check new versions with
    newVersion: {
      enabled: true,
      useAppVersion: true,
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.

  app.import('node_modules/jquery-datetimepicker/jquery.datetimepicker.css');
  app.import('node_modules/jquery-datetimepicker/build/jquery.datetimepicker.full.min.js');
  app.import('node_modules/blueimp-load-image/js/load-image.all.min.js')

  app.import('vendor/bootstrap/bootstrap-4.3.bundle.js');

  // app.import('nod_modules/@okta/okta-signin-widget/dist/css/okta-sign-in.min.css');

  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
