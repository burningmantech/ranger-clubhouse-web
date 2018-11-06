import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/overview', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/overview');
    assert.ok(route);
  });
});
