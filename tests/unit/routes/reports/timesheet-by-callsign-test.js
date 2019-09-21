import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reports/timesheet-by-callsign', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:reports/timesheet-by-callsign');
    assert.ok(route);
  });
});
