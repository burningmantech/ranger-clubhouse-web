import { module, skip /* test */ } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reports/timesheet-unconfirmed', function(hooks) {
  setupTest(hooks);

  skip('it exists', function(assert) {
    let route = this.owner.lookup('route:reports/timesheet-unconfirmed');
    assert.ok(route);
  });
});
