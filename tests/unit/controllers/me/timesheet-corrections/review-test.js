import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | me/timesheet-corrections/review', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:me/timesheet-corrections/review');
    assert.ok(controller);
  });
});
