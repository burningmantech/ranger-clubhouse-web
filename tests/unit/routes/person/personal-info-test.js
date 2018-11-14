import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/personal-info', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:person/personal-info');
    assert.ok(route);
  });
});
