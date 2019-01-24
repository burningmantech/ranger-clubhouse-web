import { module, skip /* test */ } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | reports/timesheet-correction-requests', function(hooks) {
  setupTest(hooks);

  skip('it exists', function(assert) {
    let route = this.owner.lookup('route:reports/timesheet-correction-requests');
    assert.ok(route);
  });
});
