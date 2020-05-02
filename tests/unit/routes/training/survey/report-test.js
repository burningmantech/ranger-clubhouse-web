import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | training/survey/report', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:training/survey/report');
    assert.ok(route);
  });
});
