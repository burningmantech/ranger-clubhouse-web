import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | reports/people-by-role', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:reports/people-by-role');
    assert.ok(controller);
  });
});
