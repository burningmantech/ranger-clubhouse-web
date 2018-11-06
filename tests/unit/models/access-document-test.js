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

    run(() => model.set('status', 'qualified'));
    assert.equal(model.isQualified, true);

    run(() => model.set('status', 'claimed'));
    assert.equal(model.isClaimed, true);


    run(() => model.set('status', 'banked'));
    assert.equal(model.isBanked, true);


    run(() => model.set('status', 'submitted'));
    assert.equal(model.isSubmitted, true);


    run(() => model.set('status', 'used'));
    assert.equal(model.isUsed, true);


    run(() => model.set('status', 'cancelled'));
    assert.equal(model.isCancelled, true);


    run(() => model.set('status', 'expired'));
    assert.equal(model.isExpired, true);
  });
});
