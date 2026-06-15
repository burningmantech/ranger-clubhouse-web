import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import Service from '@ember/service';

// Stub ajax/toast/house so the seam runs without Mirage. Stubs extend Service
// so Ember's container can instantiate them.
function install(owner, {requestResult, requestThrows} = {}) {
  const calls = {toastError: [], errors: [], requested: []};
  owner.register('service:ajax', class extends Service {
    async request(url, options) {
      calls.requested.push({url, options});
      if (requestThrows) { throw requestThrows; }
      return requestResult;
    }
  });
  owner.register('service:toast', class extends Service {
    error(m) { calls.toastError.push(m); }
  });
  owner.register('service:errors', class extends Service {
    handleErrorResponse(response) { calls.errors.push(response); }
  });
  return calls;
}

module('Unit | Service | command', function (hooks) {
  setupTest(hooks);

  test('dispatches to the matching status handler and returns the result', async function (assert) {
    install(this.owner, {requestResult: {status: 'ok', value: 42}});
    const command = this.owner.lookup('service:command');

    let handled = null;
    const result = await command.perform('thing/do', {a: 1}, {
      statusHandlers: {ok: (r) => { handled = r; }},
    });

    assert.strictEqual(handled.value, 42, 'ok handler invoked with the result');
    assert.strictEqual(result.status, 'ok', 'returns the parsed result');
  });

  test('an unknown status falls back to an error toast', async function (assert) {
    const calls = install(this.owner, {requestResult: {status: 'weird'}});
    const command = this.owner.lookup('service:command');

    await command.perform('thing/do', {}, {statusHandlers: {ok: () => {}}});

    assert.strictEqual(calls.toastError.length, 1, 'one fallback error toast');
    assert.ok(calls.toastError[0].includes("'weird'"), 'names the unknown status');
  });

  test('a thrown request routes to error handling and returns undefined', async function (assert) {
    const boom = {status: 500};
    const calls = install(this.owner, {requestThrows: boom});
    const command = this.owner.lookup('service:command');

    const result = await command.perform('thing/do', {});

    assert.strictEqual(result, undefined, 'returns undefined on failure');
    assert.strictEqual(calls.errors[0], boom, 'error sent to handleErrorResponse');
  });

  test('POSTs the body to the url', async function (assert) {
    const calls = install(this.owner, {requestResult: {status: 'ok'}});
    const command = this.owner.lookup('service:command');

    await command.perform('timesheet/signin', {person_id: 7}, {statusHandlers: {ok: () => {}}});

    assert.strictEqual(calls.requested[0].url, 'timesheet/signin', 'POSTs to the url');
    assert.strictEqual(calls.requested[0].options.method, 'POST', 'uses POST');
    assert.deepEqual(calls.requested[0].options.data, {person_id: 7}, 'sends the body as data');
  });
});
