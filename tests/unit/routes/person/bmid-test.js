import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/bmid', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:person/bmid');
    assert.ok(route);
  });
});
