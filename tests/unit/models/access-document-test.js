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
    assert.true(model.isQualified);

    model.set('status', 'claimed');
    assert.true(model.isClaimed);


    model.set('status', 'banked');
    assert.true(model.isBanked);


    model.set('status', 'submitted');
    assert.true(model.isSubmitted);


    model.set('status', 'used');
    assert.true(model.isUsed);


    model.set('status', 'cancelled');
    assert.true(model.isCancelled);


    model.set('status', 'expired');
    assert.true(model.isExpired);
  });
});
