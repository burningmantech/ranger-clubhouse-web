import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | person', function(hooks) {
  setupTest(hooks);

  test('isRanger works', function(assert) {
    let store = this.owner.lookup('service:store');

    let model = store.createRecord('person', { status: 'bonked' });
    assert.false(model.isRanger);

    model.set('status', 'active');
    assert.true(model.isRanger);
  });

});
