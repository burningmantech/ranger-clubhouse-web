import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | person', function(hooks) {
  setupTest(hooks);

  test('isRanger works', function(assert) {
    let store = this.owner.lookup('service:store');

    let model = run(() => store.createRecord('person', { status: 'bonked' }));
    assert.false(model.isRanger);

    run(() => model.set('status', 'active'));
    assert.true(model.isRanger);
  });

});
