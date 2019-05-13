import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | admin/rbs/unverified-stopped', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:admin/rbs/unverified-stopped');
    assert.ok(route);
  });
});
