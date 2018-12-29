import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/schedule/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/schedule/index');
    assert.ok(route);
  });
});
