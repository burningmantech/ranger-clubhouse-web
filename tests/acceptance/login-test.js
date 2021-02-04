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

    assert.equal(currentURL(), '/login');
    assert.equal(document.title, 'Login | Ranger Clubhouse');
  });

  test('successful login', async function (assert) {
    const person = server.create('person');

    await visit('/login');
    await fillIn('input[name="identification"]', person.email);
    await fillIn('input[name="password"]', person.password);
    await click('button.login-submit');
    assert.equal(currentURL(), '/me');
    assert.equal(document.title, 'Homepage | Me | Ranger Clubhouse');
  });

  test('invalid login', async function (assert) {
    await visit('/login');
    await fillIn('input[name="identification"]', 'thevoid@example.com');
    await fillIn('input[name="password"]', 'ineedashower!');
    await click('button.login-submit');

    // Should stay on the login page
    assert.equal(currentURL(), '/login', 'stay on the login page');
    assert.dom('.notice-danger').hasText(/The email and\/or password is incorrect/);
    assert.equal(document.title, 'Login | Ranger Clubhouse');
  });

  test('successful logout', async function (assert) {
    const person = server.create('person');
    await authenticateUser(person.id);
    await visit('/logout');
    assert.equal(currentSession().isAuthenticated, false);
    assert.equal(document.title, 'Login | Ranger Clubhouse');
  });

  test('person not authorized', async function (assert) {
    const person = server.create('person', {status: 'suspended'});
    await visit('/login');
    await fillIn('input[name="identification"]', person.email);
    await fillIn('input[name="password"]', person.password);
    await click('button.login-submit');

    // Should stay on the login page
    assert.equal(currentURL(), '/login', 'stay on the login page');
    // And there should be a flash modal with login error
    assert.dom('.notice-danger').hasText(/Login has been disabled/);
    assert.equal(document.title, 'Login | Ranger Clubhouse');
  });

  test('prevent space for being entered in email field', async function (assert) {
    const person = server.create('person');
    await visit('/login');
    await fillIn('input[name="identification"]', person.email + ' ');
    assert.dom('input[name="identification"]').hasValue(person.email);
  });

  test('Test password reset with login token', async function (assert) {
    const person = server.create('person', {tpassword: TOKEN});

    await visit(`/login?token=${TOKEN}`);

    assert.equal(currentURL(), '/me/password');
    assert.equal(currentSession().isAuthenticated, true);
    assert.equal(currentSession().userId, person.id);
  });

  test('Test welcome with login token', async function (assert) {
    const person = server.create('person', {tpassword: PNV_TOKEN});

    await visit(`/login?token=${PNV_TOKEN}&welcome=1`);

    assert.equal(currentURL(), '/me/welcome');
    assert.equal(currentSession().isAuthenticated, true);
    assert.equal(currentSession().userId, person.id);
  });

});
