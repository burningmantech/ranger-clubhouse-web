import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reports/radio-checkout', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:reports/radio-checkout');
    assert.ok(route);
  });
});
