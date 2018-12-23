import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | person', function(hooks) {
  setupTest(hooks);

  test('isPastProspectiveDisabled works', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('person', { status: 'past prospective', callsign_approved: false }));

    assert.equal(model.isPastProspectiveDisabled, true);
  });

  test('isRanger works', function(assert) {
    let store = this.owner.lookup('service:store');

    let model = run(() => store.createRecord('person', { status: 'bonked' }));
    assert.equal(model.isRanger, false);
    assert.equal(model.isNotRanger, true);

    run(() => model.set('status', 'active'));
    assert.equal(model.isRanger, true);
    assert.equal(model.isNotRanger, false);
  });

  test('hasRole works', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('person', { roles: [ 1, 2 ] }));

    assert.equal(model.hasRole(1), true);
    assert.equal(model.hasRole(3), false);
  });

  test('hasAllRoles works', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('person', { roles: [ 1, 2 ] }));

    assert.equal(model.hasAllRoles([1,2]), true);
    assert.equal(model.hasAllRoles([1,2,3]), false);
  });

});
