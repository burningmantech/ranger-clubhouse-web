import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/event-info', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/event-info');
    assert.ok(route);
  });
});
