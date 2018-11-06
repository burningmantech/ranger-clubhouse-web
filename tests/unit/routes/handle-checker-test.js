import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | handle-checker', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:handle-checker');
    assert.ok(route);
  });

  // TODO lots more tests
});
