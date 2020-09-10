import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | person/external-ids', function(hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:person/external-ids');
    assert.ok(controller);
  });
});
