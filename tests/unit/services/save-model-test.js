import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import Service from '@ember/service';
import Changeset from 'ember-changeset';

// Minimal stubs so the seam can be exercised without Mirage or a real store.
// They extend Service so Ember's container can instantiate them.
function install(owner) {
  const calls = {toastSuccess: [], toastClear: 0, errors: []};
  owner.register('service:toast', class extends Service {
    clear() { calls.toastClear++; }
    success(m) { calls.toastSuccess.push(m); }
  });
  owner.register('service:errors', class extends Service {
    handleErrorResponse(response, changeSet) { calls.errors.push({response, changeSet}); }
  });
  return calls;
}

module('Unit | Service | save-model', function (hooks) {
  setupTest(hooks);

  test('record save: resolves true, toasts, resets the guard', async function (assert) {
    const calls = install(this.owner);
    const service = this.owner.lookup('service:save-model');

    let saved = false;
    const owner = {isSubmitting: false};
    const model = {save: async () => { saved = true; }, rollbackAttributes() { assert.step('rollback'); }};

    const ok = await service.save({model, message: 'Saved.', owner});

    assert.true(ok, 'returns true on success');
    assert.true(saved, 'model.save() was called');
    assert.deepEqual(calls.toastSuccess, ['Saved.'], 'success toast shown');
    assert.false(owner.isSubmitting, 'guard reset in finally');
    assert.verifySteps([], 'no rollback on success');
  });

  test('guard: a save already in flight is refused', async function (assert) {
    install(this.owner);
    const service = this.owner.lookup('service:save-model');

    let saveCalled = false;
    const model = {save: async () => { saveCalled = true; }};

    const ok = await service.save({model, owner: {isSubmitting: true}});

    assert.false(ok, 'returns false when already submitting');
    assert.false(saveCalled, 'model.save() never called');
  });

  test('record failure: rolls back the record and reports the error', async function (assert) {
    const calls = install(this.owner);
    const service = this.owner.lookup('service:save-model');

    const response = {status: 422};
    const owner = {isSubmitting: false};
    const model = {save: async () => { throw response; }, rollbackAttributes() { assert.step('rollback'); }};

    const ok = await service.save({model, owner});

    assert.false(ok, 'returns false on failure');
    assert.verifySteps(['rollback'], 'bare record is rolled back');
    assert.strictEqual(calls.errors[0].response, response, 'error reported');
    assert.strictEqual(calls.errors[0].changeSet, null, 'no changeset passed for a bare record');
    assert.false(owner.isSubmitting, 'guard reset even on failure');
  });

  test('changeset failure: passes the changeset to errors and does NOT rollbackAttributes', async function (assert) {
    const calls = install(this.owner);
    const service = this.owner.lookup('service:save-model');

    const response = {status: 422};
    // A real changeset so isChangeset() is true; its underlying save rejects.
    const underlying = {save: async () => { throw response; }};
    const changeset = new Changeset(underlying);

    const ok = await service.save({model: changeset, message: 'nope'});

    assert.false(ok, 'returns false on failure');
    assert.strictEqual(calls.errors[0].changeSet, changeset, 'changeset passed to errors for field mapping');
    assert.strictEqual(calls.toastSuccess.length, 0, 'no success toast on failure');
    // A changeset has no rollbackAttributes(); the seam must not call it (would throw).
    assert.strictEqual(typeof changeset.rollbackAttributes, 'undefined', 'changeset has no rollbackAttributes to call');
  });
});
