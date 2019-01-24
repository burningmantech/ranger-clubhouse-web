import { module, skip /* test */ } from 'qunit';
import validateBlah from 'clubhouse/validators/blah';

module('Unit | Validator | blah', function() {
  skip('it exists', function(assert) {
    assert.ok(validateBlah());
  });
});
