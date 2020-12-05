import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | mentor/alpha-signout', function(hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:mentor/alpha-signout');
    assert.ok(controller);
  });
});
