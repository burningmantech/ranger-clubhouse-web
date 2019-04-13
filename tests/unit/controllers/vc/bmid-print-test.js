import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | vc/bmid-print', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:vc/bmid-print');
    assert.ok(controller);
  });
});
