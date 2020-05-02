import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/survey', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/survey');
    assert.ok(route);
  });
});
