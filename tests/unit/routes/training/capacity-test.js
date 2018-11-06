import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | training/capacity', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:training/capacity');
    assert.ok(route);
  });
});
