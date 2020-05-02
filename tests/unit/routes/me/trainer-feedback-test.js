import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/trainer-feedback', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/trainer-feedback');
    assert.ok(route);
  });
});
