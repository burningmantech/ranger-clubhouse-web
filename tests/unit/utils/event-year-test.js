import eventYear from 'clubhouse/utils/event-year';
import { module, test } from 'qunit';

module('Unit | Utility | event-year', function() {

  test('it works', function(assert) {
    let result = eventYear();
    assert.ok(result);
  });
});
