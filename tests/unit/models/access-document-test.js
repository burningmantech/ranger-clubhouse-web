import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | access document', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it computes statuses correctly', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('access-document', {}));
    assert.ok(model);

    model.set('status', 'qualified');
    assert.equal(model.isQualified, true);

    model.set('status', 'claimed');
    assert.equal(model.isClaimed, true);


    model.set('status', 'banked');
    assert.equal(model.isBanked, true);


    model.set('status', 'submitted');
    assert.equal(model.isSubmitted, true);


    model.set('status', 'used');
    assert.equal(model.isUsed, true);


    model.set('status', 'cancelled');
    assert.equal(model.isCancelled, true);


    model.set('status', 'expired');
    assert.equal(model.isExpired, true);
  });
});
