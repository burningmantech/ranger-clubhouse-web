'use strict';

module.exports = {
extends: 'recommended',
  rules: {
    'no-action': false,
    'require-input-label': false,
    'no-whitespace-for-layout': false,
    'no-whitespace-within-word': false,
    'no-implicit-this': { allow: [ 'rootURL' ] }
  },
};
