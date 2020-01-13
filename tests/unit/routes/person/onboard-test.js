import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/onboard', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:person/onboard');
    assert.ok(route);
  });
});
