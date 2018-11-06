import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/tickets', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/tickets');
    assert.ok(route);
  });
});
