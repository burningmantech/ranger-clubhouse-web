import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | training/survey', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:training/survey');
    assert.ok(route);
  });
});
