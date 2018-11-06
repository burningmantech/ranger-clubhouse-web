import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/mentees', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:me/mentees');
    assert.ok(route);
  });
});
