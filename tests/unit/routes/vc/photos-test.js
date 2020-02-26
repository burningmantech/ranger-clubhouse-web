import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | vc/photos', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:vc/photos');
    assert.ok(route);
  });
});
