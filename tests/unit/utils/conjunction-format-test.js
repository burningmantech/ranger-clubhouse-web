import conjunctionFormat from 'clubhouse/utils/conjunction-format';
import { module, test } from 'qunit';

module('Unit | Utility | conjunction-format', function() {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = conjunctionFormat([ 'a', 'b', 'c'], 'and');
    assert.strictEqual(result, 'a, b and c');
  });
});
