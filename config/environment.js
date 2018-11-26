/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'clubhouse',
    environment,
    rootURL: '/',
    locationType: 'auto',
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
    },

    'ember-simple-auth': {
      authorizer: 'authorizer:token',
      routeAfterAuthentication: '/'
    },

    'ember-simple-auth-token': {
      // NOTE: setting refreshAccessTokens true will hang the tests since
      // there is an outstanding timeout
      refreshAccessTokens      : false,
      identificationField      : 'identification',
      passwordField            : 'password',
      tokenPropertyName        : 'token',
      refreshTokenPropertyName : 'token',
    //  tokenExpireName          : 'expires_in',

      authorizationPrefix      : 'JWT ',
      authorizationHeaderName  : 'Authorization',
      headers                  : {}
    },

    'dualClubhouse':    false,

    showAjaxErrors: true,

    'ember-toastr': {
      toastrOptions: {
        progressBar: false,
        showMethod: 'show',
        showDuration: 0,

        closeMethod: 'hide',
        closeDuration: 0,
        hideDuration: 0,

        positionClass: 'toast-top-center'
      }
    }

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

    ENV.dualClubhouse = true;
    ENV.clubhouseClassicUrl = 'http://localhost:9000';

    ENV['ember-simple-auth-token'].serverTokenEndpoint = 'http://localhost:8000/auth/login'
    ENV['ember-simple-auth-token'].serverTokenRefreshEndpoint = 'http://localhost:8000/auth/refresh'

    ENV['api-server'] = 'http://localhost:8000'

    ENV['ember-cli-mirage'] = {
      enabled: false
    };

  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    ENV.dualClubhouse = false;
    ENV.clubhouseClassicUrl = null;

    ENV['ember-simple-auth-token'].serverTokenEndpoint = 'http://localhost:8000/api/auth/login'
    ENV['ember-simple-auth-token'].serverTokenRefreshEndpoint = 'http://localhost:8000/api/auth/refresh'

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
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    ENV.rootURL = '/client';
    ENV.dualClubhouse = true;
    ENV.clubhouseClassicUrl = '/classic';

    ENV['ember-simple-auth-token'].serverTokenEndpoint = '/api/auth/login';
    ENV['ember-simple-auth-token'].serverTokenRefreshEndpoint = '/api/auth/refresh';
    ENV['api-server'] = '/api';
  }

  return ENV;
};
