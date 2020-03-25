import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | vc/spigot', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:vc/spigot');
    assert.ok(route);
  });
});
