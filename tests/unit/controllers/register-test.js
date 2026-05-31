import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

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
    const test = this;

    this.owner.register('service:ajax', class extends Service {
      post(url, options) {
        test.posted = { url, options };
        return Promise.resolve({ status: 'success' });
      }
    });
    // Swallow the success modal without firing its transition callback, while
    // recording calls so tests can assert info() fired.
    this.modalInfoCalls = [];
    this.owner.register('service:modal', class extends Service {
      info(...args) { test.modalInfoCalls.push(args); }
    });
    this.owner.register('service:router', class extends Service {
      transitionTo() {}
    });
    this.owner.register('service:house', class extends Service {
      scrollToTop() {}
      handleErrorResponse() {}
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
});
