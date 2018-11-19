import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/schedule', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:person/schedule');
    assert.ok(route);
  });
});
