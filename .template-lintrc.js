'use strict';

module.exports = {
extends: 'recommended',
  rules: {
    'no-action': false,
    'require-input-label': false,
    'no-whitespace-for-layout': false,
    'no-whitespace-within-word': false,
    'no-curly-component-invocation': { allow: ['general-support-email', 'vc-email', 'admin-email'] },
    'no-implicit-this': { allow: [ 'general-support-email', 'vc-email', 'admin-email', 'rootURL' ] }
  },
};
