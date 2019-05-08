import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | hq/assets', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:hq/assets');
    assert.ok(route);
  });
});
