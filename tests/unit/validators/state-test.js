import { module, test } from 'qunit';
import validateState from 'clubhouse/validators/state';

module('Unit | Validator | state');

test('it exists', function(assert) {
  assert.ok(validateState());
});
