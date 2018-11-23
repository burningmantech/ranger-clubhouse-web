import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/broadcast-log', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:person/broadcast-log');
    assert.ok(route);
  });
});
