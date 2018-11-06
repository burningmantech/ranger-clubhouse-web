import { module, test } from 'qunit';
import validateBlah from 'clubhouse/validators/blah';

module('Unit | Validator | blah', function() {
  test('it exists', function(assert) {
    assert.ok(validateBlah());
  });
});
