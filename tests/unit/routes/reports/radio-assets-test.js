import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reports/radio-assets', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:reports/radio-assets');
    assert.ok(route);
  });
});
