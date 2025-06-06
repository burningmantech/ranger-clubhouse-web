/* eslint-env node */
'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'clubhouse',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      buildTimestamp: new Date().toLocaleString('en-US', {
        dateStyle: "medium",
        timeStyle: "long",
        hourCycle: "h24",
        timeZone: "America/Los_Angeles"
      })
    },

    exportApplicationGlobal: true,  // Setup 'window.Clubhouse' so error logging can grab the current user's id.

    showAjaxErrors: true,

    logRoutes: false, // Send each route transition to the backend for analytic reporting

    'ember-toastr': {
      toastrOptions: {
        progressBar: false,
        showMethod: 'show',
        showDuration: 0,

        closeMethod: 'hide',
        closeDuration: 0,
        hideDuration: 0,

        positionClass: 'toast-top-right'
      }
    },

    newVersion: {pollSeconds: 60, fileName: 'VERSION.txt'}
  };

  if (environment === 'development') {
//    ENV.APP.LOG_RESOLVER = true;
//    ENV.APP.LOG_ACTIVE_GENERATION = true;
//    ENV.APP.LOG_TRANSITIONS = true;
//    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
//    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.contentSecurityPolicy = {
      'default-src': "'none'",
      'script-src': "'self' *",
      'font-src': "'self' *",
      'connect-src': "'self' *",
      'img-src': "'self' *",
      'style-src': "'self' 'unsafe-inline' ",
      'media-src': "'self' *"
    }

    ENV['api-server'] = 'http://localhost:8000';

    ENV['ember-cli-mirage'] = {
      enabled: false,
      excludeFilesFromBuild: true // Don't include lodash and everything else mirage needs
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // Mirage will intercept the request and handle it.
    ENV['api-server'] = 'http://localhost:8000/api'

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
    ENV['ember-cli-mirage'] = {
      enabled: true,
      autostart: true
    };

    ENV.showAjaxErrors = false;
    ENV.logEmberErrors = false;
    ENV.logRoutes = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    ENV.rootURL = (process.env.RANGER_CLUBHOUSE_CLIENT_PREFIX || '/');

    // Try to report any non-recoverable errors.
    ENV.logEmberErrors = true;

    // Trace people has they navigate thru the client
    ENV.logRoutes = true;

    ENV['api-server'] = (process.env.RANGER_CLUBHOUSE_API_URL || '/api');
    ENV['ember-cli-mirage'] = {
      enabled: false,
      excludeFilesFromBuild: true // Don't include lodash and everything else mirage needs
    };
  }

  return ENV;
};
