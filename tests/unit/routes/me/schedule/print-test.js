import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/schedule/print', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/schedule/print');
    assert.ok(route);
  });
});
