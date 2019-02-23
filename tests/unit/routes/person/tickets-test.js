import { module, skip } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | person/tickets', function(hooks) {
  setupTest(hooks);

  skip('it exists', function(assert) {
    let route = this.owner.lookup('route:person/tickets');
    assert.ok(route);
  });
});
