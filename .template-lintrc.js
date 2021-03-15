'use strict';

module.exports = {
  extends: 'octane',
  rules: {
    'attribute-indentation': false,
    'block-indentation': false,
    'no-action': false,
    'no-quoteless-attributes': false,
    'require-input-label': false,
    'no-curly-component-invocation': { allow: ['general-support-email', 'vc-email', 'admin-email'] },
    'no-implicit-this': { allow: [ 'general-support-email', 'vc-email', 'admin-email' ] }
  },
};
