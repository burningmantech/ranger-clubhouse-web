import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | hq/shift', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:hq/shift');
    assert.ok(route);
  });
});
