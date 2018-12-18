import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | training/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:training/index');
    assert.ok(route);
  });
});
