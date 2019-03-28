import { module, skip } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | hq/site-checkin', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  skip('it exists', function(assert) {
    let controller = this.owner.lookup('controller:hq/site-checkin');
    assert.ok(controller);
  });
});
