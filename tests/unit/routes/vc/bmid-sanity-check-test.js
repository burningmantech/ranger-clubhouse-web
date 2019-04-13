import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | vc/bmid-sanity-check', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:vc/bmid-sanity-check');
    assert.ok(route);
  });
});
