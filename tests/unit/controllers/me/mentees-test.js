import { module, skip /* test */ } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | me/mentees', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  skip('it exists', function(assert) {
    let controller = this.owner.lookup('controller:me/mentees');
    assert.ok(controller);
  });
});
