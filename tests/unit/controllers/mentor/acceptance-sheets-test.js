import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | mentor/acceptance-sheets', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:mentor/acceptance-sheets');
    assert.ok(controller);
  });
});
