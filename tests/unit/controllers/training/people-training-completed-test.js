import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | training/people-training-completed', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:training/people-training-completed');
    assert.ok(controller);
  });
});
