import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | training/session/signup-sheet', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:training/session/signup-sheet');
    assert.ok(controller);
  });
});
