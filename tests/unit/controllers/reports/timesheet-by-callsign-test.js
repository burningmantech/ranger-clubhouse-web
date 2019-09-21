import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | reports/timesheet-by-callsign', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:reports/timesheet-by-callsign');
    assert.ok(controller);
  });
});
