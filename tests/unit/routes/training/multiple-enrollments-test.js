import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | training/multiple-enrollments', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:training/multiple-enrollments');
    assert.ok(route);
  });
});
