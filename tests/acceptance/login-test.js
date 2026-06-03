import {module, test} from 'qunit';
import {visit, currentURL, fillIn, click} from '@ember/test-helpers';
import {setupApplicationTest} from 'ember-qunit';
import {currentSession} from 'ember-simple-auth/test-support';
import {authenticateUser} from "../helpers/authenticate-user";

// Temporary login tokens (tpassword). The values themselves are arbitrary; the
// names document what each represents so the assertions below read clearly.
const PASSWORD_RESET_TOKEN = 'deadbeef';
const WELCOME_TOKEN = 'beeff00d';

// Distinct user-visible error copy the login template renders for each failure
// path (see app/templates/login.hbs). Invalid credentials and a disabled
// (suspended) account land on different UiNotice messages, and the tests below
// assert that distinction rather than merely "stayed on /login".
const INVALID_CREDENTIALS_MESSAGE = 'The email was not found, or the password is incorrect.';
const DISABLED_ACCOUNT_MESSAGE = 'This account has been disabled and cannot be logged into.';

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting / redirect to /login', async function (assert) {
    // make sure / redirects to /login
    await visit('/');

    assert.strictEqual(currentURL(), '/login');
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');
  });

  test('successful login', async function (assert) {
    const person = this.server.create('person');

    await visit('/login');
    await fillIn('input[name="identification"]', person.email);
    await fillIn('input[name="password"]', person.password);
    await click('button.login-submit');
    assert.strictEqual(currentURL(), '/me');
    assert.strictEqual(document.title, 'Homepage | Me | Ranger Clubhouse');
  });

  test('invalid login shows the invalid-credentials notice', async function (assert) {
    // No matching person -> Mirage returns 401 {error: 'invalid-credentials'}.
    await visit('/login');
    await fillIn('input[name="identification"]', 'thevoid@example.com');
    await fillIn('input[name="password"]', 'ineedashower!');
    await click('button.login-submit');

    // Should stay on the login page.
    assert.strictEqual(currentURL(), '/login', 'stay on the login page');
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');

    // The invalid-credentials path shows the "not found / incorrect" notice and
    // NOT the disabled-account notice.
    assert.dom(this.element).includesText(INVALID_CREDENTIALS_MESSAGE,
      'invalid credentials shows the not-found/incorrect message');
    assert.dom(this.element).doesNotIncludeText(DISABLED_ACCOUNT_MESSAGE,
      'invalid credentials does not show the disabled-account message');
  });

  test('successful logout', async function (assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);
    await visit('/logout');
    assert.false(currentSession().isAuthenticated);
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');
  });

  test('suspended person shows the disabled-account notice', async function (assert) {
    // A suspended person -> Mirage returns 401 {error: 'account-disabled'}.
    const person = this.server.create('person', {status: 'suspended'});
    await visit('/login');
    await fillIn('input[name="identification"]', person.email);
    await fillIn('input[name="password"]', person.password);
    await click('button.login-submit');

    // Should stay on the login page.
    assert.strictEqual(currentURL(), '/login', 'stay on the login page');
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');

    // The disabled-account path shows the "account has been disabled" notice and
    // NOT the invalid-credentials notice. This is the distinction the previous
    // test missed: both paths kept the user on /login, but each renders a
    // different message.
    assert.dom(this.element).includesText(DISABLED_ACCOUNT_MESSAGE,
      'a suspended account shows the disabled-account message');
    assert.dom(this.element).doesNotIncludeText(INVALID_CREDENTIALS_MESSAGE,
      'a suspended account does not show the invalid-credentials message');
  });

  test('prevent space for being entered in email field', async function (assert) {
    const person = this.server.create('person');
    await visit('/login');
    await fillIn('input[name="identification"]', person.email + ' ');
    assert.dom('input[name="identification"]').hasValue(person.email);
  });

  test('Test password reset with login token', async function (assert) {
    const person = this.server.create('person', {tpassword: PASSWORD_RESET_TOKEN});

    await visit(`/login?token=${PASSWORD_RESET_TOKEN}`);

    assert.strictEqual(currentURL(), '/me/password');
    assert.true(currentSession().isAuthenticated);
    assert.strictEqual(+currentSession().userId, +person.id);
  });

  test('Test welcome with login token', async function (assert) {
    const person = this.server.create('person', {tpassword: WELCOME_TOKEN});

    await visit(`/login?token=${WELCOME_TOKEN}&welcome=1`);

    assert.strictEqual(currentURL(), '/me/welcome');
    assert.true(currentSession().isAuthenticated);
    assert.strictEqual(+currentSession().userId, +person.id);
  });

});
