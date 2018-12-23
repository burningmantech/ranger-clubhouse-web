import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/timesheet/review', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/timesheet/review');
    assert.ok(route);
  });
});
