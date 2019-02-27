import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | mentor', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:mentor');
    assert.ok(route);
  });
});
