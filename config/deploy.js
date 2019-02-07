/* eslint-env node */
'use strict';

module.exports = function (deployTarget) {

  let s3Prefix = (process.env.RANGER_CLUBHOUSE_CLIENT_PREFIX || 'client').replace(/^\//, '');

  let ENV = {
    build: {},
    // include other plugin configuration that applies to all deploy targets here

    // Do not try to DRY up s3 & s3-index - both object are manipulated as the buid proceeds.
    s3: {
      filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,html}',
      accessKeyId: process.env.RANGER_CLUBHOUSE_S3_ACCESS_KEY,
      secretAccessKey: process.env.RANGER_CLUBHOUSE_S3_SECRET_KEY,
      bucket: (process.env.RANGER_CLUBHOUSE_AWS_S3_BUCKET || 'ranger-town'),
      region: (process.env.RANGER_CLUBHOUSE_AWS_S3_REGION || 'us-west-2'),
      prefix: s3Prefix,
    },

    's3-index': {
      accessKeyId: process.env.RANGER_CLUBHOUSE_S3_ACCESS_KEY,
      secretAccessKey: process.env.RANGER_CLUBHOUSE_S3_SECRET_KEY,
      bucket: (process.env.RANGER_CLUBHOUSE_S3_BUCKET || 'ranger-town'),
      region: (process.env.RANGER_CLUBHOUSE_S3_REGION || 'us-west-2'),
      prefix: s3Prefix,

      allowOverwrite: true,
    },

    };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    // configure other plugins for staging deploy target here
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
