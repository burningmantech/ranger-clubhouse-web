import { module, skip /* test */ } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | admin/error-log', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  skip('it exists', function(assert) {
    let controller = this.owner.lookup('controller:admin/error-log');
    assert.ok(controller);
  });
});
