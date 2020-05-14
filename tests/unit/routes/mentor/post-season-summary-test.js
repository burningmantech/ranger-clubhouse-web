import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | mentor/post-season-summary', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:mentor/post-season-summary');
    assert.ok(route);
  });
});
