import containsEmail from 'clubhouse/utils/contains-email';
import { module, test } from 'qunit';

module('Unit | Utility | contains-email', function(/*hooks*/) {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = containsEmail('test@example.com');
    assert.ok(result);
  });
});
