import groupBy from 'clubhouse/utils/group-by';
import { module, test } from 'qunit';

module('Unit | Utility | group-by', function() {

  test('it works', function(assert) {
    let result = groupBy();
    assert.ok(result);
  });
});
