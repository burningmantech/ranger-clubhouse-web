import {module, test} from 'qunit';
import {visit, currentURL, fillIn, click} from '@ember/test-helpers';
import {setupApplicationTest} from 'ember-qunit';
import {currentSession} from 'ember-simple-auth/test-support';
import {authenticateUser} from "../helpers/authenticate-user";

const TOKEN = 'deadbeef';
const PNV_TOKEN = 'beeff00d';

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

  test('invalid login', async function (assert) {
    await visit('/login');
    await fillIn('input[name="identification"]', 'thevoid@example.com');
    await fillIn('input[name="password"]', 'ineedashower!');
    await click('button.login-submit');

    // Should stay on the login page
    assert.strictEqual(currentURL(), '/login', 'stay on the login page');
    assert.dom('.alert-danger').hasText(/The email and\/or password is incorrect/);
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');
  });

  test('successful logout', async function (assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);
    await visit('/logout');
    assert.false(currentSession().isAuthenticated);
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');
  });

  test('person not authorized', async function (assert) {
    const person = this.server.create('person', {status: 'suspended'});
    await visit('/login');
    await fillIn('input[name="identification"]', person.email);
    await fillIn('input[name="password"]', person.password);
    await click('button.login-submit');

    // Should stay on the login page
    assert.strictEqual(currentURL(), '/login', 'stay on the login page');
    // And there should be a flash modal with login error
    assert.dom('.alert-danger').hasText(/Login has been disabled/);
    assert.strictEqual(document.title, 'Login | Ranger Clubhouse');
  });

  test('prevent space for being entered in email field', async function (assert) {
    const person = this.server.create('person');
    await visit('/login');
    await fillIn('input[name="identification"]', person.email + ' ');
    assert.dom('input[name="identification"]').hasValue(person.email);
  });

  test('Test password reset with login token', async function (assert) {
    const person = this.server.create('person', {tpassword: TOKEN});

    await visit(`/login?token=${TOKEN}`);

    assert.strictEqual(currentURL(), '/me/password');
    assert.true(currentSession().isAuthenticated);
    assert.strictEqual(+currentSession().userId, +person.id);
  });

  test('Test welcome with login token', async function (assert) {
    const person = this.server.create('person', {tpassword: PNV_TOKEN});

    await visit(`/login?token=${PNV_TOKEN}&welcome=1`);

    assert.strictEqual(currentURL(), '/me/welcome');
    assert.true(currentSession().isAuthenticated);
    assert.strictEqual(+currentSession().userId, +person.id);
  });

});
