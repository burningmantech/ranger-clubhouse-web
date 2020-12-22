import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | person', function(hooks) {
  setupTest(hooks);

  test('isRanger works', function(assert) {
    let store = this.owner.lookup('service:store');

    let model = run(() => store.createRecord('person', { status: 'bonked' }));
    assert.equal(model.isRanger, false);
    assert.equal(model.isNotRanger, true);

    run(() => model.set('status', 'active'));
    assert.equal(model.isRanger, true);
    assert.equal(model.isNotRanger, false);
  });

});
