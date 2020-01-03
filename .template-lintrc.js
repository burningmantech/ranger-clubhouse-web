'use strict';

module.exports = {
  extends: 'octane',
  rules: {
      'attribute-indentation': false,
      'block-indentation': false,
      // The linter whines about two position strings next to each other
      // e..g, {{cgo 'person' 'edit'}}
      'no-unnecessary-concat': false,
      'no-triple-curlies': false,
      'simple-unless': false,

      'no-implicit-this ': false,
  },
};
