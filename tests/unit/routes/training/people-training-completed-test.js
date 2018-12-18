import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | training/people-training-completed', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:training/people-training-completed');
    assert.ok(route);
  });
});
