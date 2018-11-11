import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/timesheets/review', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/timesheets/review');
    assert.ok(route);
  });
});
