import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | slot', function(hooks) {
  setupTest(hooks);

  test('slotDay works', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('slot', { begins: '2017-08-09 10:11:12'}));
    assert.strictEqual(model.slotDay, '2017-08-09');
  });
});
