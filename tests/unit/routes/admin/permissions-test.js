import { module, skip /* test */ } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | admin/permissions', function(hooks) {
  setupTest(hooks);

  skip('it exists', function(assert) {
    let route = this.owner.lookup('route:admin/permissions');
    assert.ok(route);
  });
});
