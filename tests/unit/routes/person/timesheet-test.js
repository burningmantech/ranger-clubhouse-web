import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/timesheet', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:person/timesheet');
    assert.ok(route);
  });
});
