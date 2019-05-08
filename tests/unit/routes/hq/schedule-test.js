import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | hq/schedule', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:hq/schedule');
    assert.ok(route);
  });
});
