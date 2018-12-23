import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/help', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/help');
    assert.ok(route);
  });
});
