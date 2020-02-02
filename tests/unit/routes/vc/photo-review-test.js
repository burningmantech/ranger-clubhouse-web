import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | vc/photo-review', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:vc/photo-review');
    assert.ok(route);
  });
});
