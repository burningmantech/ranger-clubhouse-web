import { module, skip /* test */ } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | me/homepage', function(hooks) {
  setupTest(hooks);

  skip('it exists', function(assert) {
    let route = this.owner.lookup('route:me/homepage');
    assert.ok(route);
  });
});
