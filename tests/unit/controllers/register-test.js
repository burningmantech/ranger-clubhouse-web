import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import { spy } from 'clubhouse/tests/helpers/spy';

// Minimal changeset stand-in: createAccount() only uses get() and pushErrors().
class FakeModel {
  constructor(values) {
    this.values = values;
    this.errors = [];
  }

  get(key) {
    return this.values[key];
  }

  pushErrors(key, message) {
    this.errors.push({ key, message });
  }
}

// Every field a valid submission would carry, including the two that must NOT
// reach the person payload (human, password_confirmation).
function validValues() {
  return {
    human: '35',
    intent: 'Sitin',
    password_confirmation: 'secret-pw',
    email: 'auditor@example.com',
    first_name: 'Ada',
    mi: 'B',
    last_name: 'Lovelace',
    street1: '1 Playa Rd',
    street2: '',
    apt: '',
    city: 'Black Rock City',
    state: 'NV',
    country: 'USA',
    zip: '89412',
    password: 'secret-pw',
    home_phone: '555-1212',
    alt_phone: '555-3434',
  };
}

module('Unit | Controller | register', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.posted = null;
    // Status the fake ajax endpoint reports back; tests can override.
    this.responseStatus = 'success';
    // When set, the fake ajax rejects with this value instead of resolving.
    this.rejectWith = null;
    const test = this;

    this.owner.register('service:ajax', class extends Service {
      post(url, options) {
        test.posted = { url, options };
        if (test.rejectWith) {
          return Promise.reject(test.rejectWith);
        }
        return Promise.resolve({ status: test.responseStatus });
      }
    });
    // Record info() calls and capture the success callback so tests can fire it.
    this.modalInfoCalls = [];
    this.owner.register('service:modal', class extends Service {
      info(...args) { test.modalInfoCalls.push(args); }
    });
    this.transitionTo = spy();
    this.owner.register('service:router', class extends Service {
      transitionTo = test.transitionTo;
    });
    this.scrollToTop = spy();
    this.handleErrorResponse = spy();
    this.owner.register('service:house', class extends Service {
      scrollToTop = test.scrollToTop;
      handleErrorResponse = test.handleErrorResponse;
    });
  });

  test('the register payload never leaks human or password_confirmation as person attributes', async function (assert) {
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel(validValues());

    await controller.createAccount(model, true);

    assert.ok(this.posted, 'a request was posted');
    assert.strictEqual(this.posted.url, 'person/register', 'posts to person/register');

    const { person, intent, human } = this.posted.options.data;

    // The security boundary: these are validated client-side but must never be
    // sent as person attributes (L10).
    assert.notOk('human' in person, 'person payload omits human');
    assert.notOk('password_confirmation' in person, 'person payload omits password_confirmation');

    // The person payload contains exactly the allow-listed fields plus status.
    assert.deepEqual(
      Object.keys(person).sort(),
      [
        'alt_phone', 'apt', 'city', 'country', 'email', 'first_name',
        'home_phone', 'last_name', 'mi', 'password', 'state', 'status',
        'street1', 'street2', 'zip',
      ],
      'person payload carries only the allow-listed fields plus status'
    );
    assert.strictEqual(person.status, 'auditor', 'status is set to auditor');
    assert.strictEqual(person.password, 'secret-pw', 'password IS forwarded into the person payload');

    // human and intent ride alongside person, not inside it.
    assert.strictEqual(human, '35', 'human is sent at the top level for server re-validation');
    assert.strictEqual(intent, 'Sitin', 'intent is sent at the top level');
  });

  test('a bad human answer is rejected before any request is made', async function (assert) {
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel({ ...validValues(), human: '34' });

    await controller.createAccount(model, true);

    assert.strictEqual(this.posted, null, 'no request is posted when the bot check fails');
    assert.strictEqual(model.errors.length, 1, 'an error is pushed onto the human field');
    assert.strictEqual(model.errors[0].key, 'human', 'the error targets the human field');
  });

  test('an invalid form is ignored', async function (assert) {
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel(validValues());

    await controller.createAccount(model, false);

    assert.strictEqual(this.posted, null, 'no request is posted when isValid is false');
  });

  test('a Ranger intent shows a modal and posts nothing', async function (assert) {
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel({ ...validValues(), intent: 'Ranger' });

    await controller.createAccount(model, true);

    assert.strictEqual(this.posted, null, 'no request is posted when intent is Ranger');
    assert.strictEqual(this.modalInfoCalls.length, 1, 'an info modal is shown');
  });

  test('a successful registration shows the success modal and transitions to login', async function (assert) {
    this.responseStatus = 'success';
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel(validValues());

    await controller.createAccount(model, true);

    assert.strictEqual(this.modalInfoCalls.length, 1, 'a success modal is shown');
    assert.strictEqual(
      this.modalInfoCalls[0][0],
      'Account Successfully Created',
      'the success modal uses the success title'
    );

    // The transition is wired to the modal dismissal callback, not fired eagerly.
    assert.false(this.transitionTo.called, 'no transition before the modal is dismissed');
    const dismissCallback = this.modalInfoCalls[0][2];
    dismissCallback();
    assert.true(this.transitionTo.called, 'transition fires when the modal is dismissed');
    assert.deepEqual(this.transitionTo.lastArgs, ['login'], 'transitions to the login route');
  });

  test('an unknown server status falls through to the Unknown Status modal', async function (assert) {
    this.responseStatus = 'wat';
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel(validValues());

    await controller.createAccount(model, true);

    assert.strictEqual(this.modalInfoCalls.length, 1, 'a modal is shown for the unknown status');
    assert.strictEqual(this.modalInfoCalls[0][0], 'Unknown Status', 'the default branch reports Unknown Status');
    assert.true(
      this.modalInfoCalls[0][1].includes('wat'),
      'the unknown status value is surfaced in the modal body'
    );
    assert.false(this.transitionTo.called, 'no transition occurs on an unknown status');
  });

  test('handleRegisterResult success path transitions through the modal callback', function (assert) {
    const controller = this.owner.lookup('controller:register');

    controller.handleRegisterResult({ status: 'success' });

    assert.strictEqual(this.modalInfoCalls.length, 1, 'the success modal is shown');
    this.modalInfoCalls[0][2]();
    assert.deepEqual(this.transitionTo.lastArgs, ['login'], 'the dismissal callback transitions to login');
  });

  test('a re-entrant createAccount is a no-op while a save is in flight', async function (assert) {
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel(validValues());

    // Simulate a request already in flight: the double-submit guard must bail
    // before posting anything.
    controller.isSaving = true;
    await controller.createAccount(model, true);

    assert.strictEqual(this.posted, null, 'no request is posted while isSaving is true');
    assert.strictEqual(this.modalInfoCalls.length, 0, 'no modal is shown by the guarded call');
  });

  test('a rejected request routes to the house error handler and clears isSaving', async function (assert) {
    const failure = { status: 422 };
    this.rejectWith = failure;
    const controller = this.owner.lookup('controller:register');
    const model = new FakeModel(validValues());

    await controller.createAccount(model, true);

    assert.ok(this.posted, 'the request was attempted');
    assert.true(this.handleErrorResponse.called, 'house.handleErrorResponse is invoked on failure');
    assert.deepEqual(
      this.handleErrorResponse.lastArgs,
      [failure, model],
      'the error response and the model are passed to the handler'
    );
    assert.strictEqual(this.modalInfoCalls.length, 0, 'no success modal is shown on failure');
    assert.false(controller.isSaving, 'isSaving is reset after the request settles');
  });

  test('stepAction only accepts known wizard steps', function (assert) {
    const controller = this.owner.lookup('controller:register');

    controller.stepAction('register');
    assert.strictEqual(controller.step, 'register', 'a known step is accepted');

    controller.stepAction('bogus-step');
    assert.strictEqual(controller.step, 'register', 'an unknown step is ignored');
  });

  test('resetWizard restores the initial wizard state', function (assert) {
    const controller = this.owner.lookup('controller:register');
    controller.step = 'register';
    controller.registerForm = { email: 'x@example.com' };

    controller.resetWizard();

    assert.strictEqual(controller.step, 'ask-intent', 'step resets to ask-intent');
    assert.deepEqual(controller.registerForm, {}, 'registerForm resets to empty');
  });
});
