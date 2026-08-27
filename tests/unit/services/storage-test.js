import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

const SESSION_KEY = 'clubhouse';
const DEVICE_KEY = 'clubhouse-device';

module('Unit | Service | storage', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(DEVICE_KEY);
  });

  hooks.afterEach(function () {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(DEVICE_KEY);
  });

  test('session & device preferences are stored under separate localStorage keys', function (assert) {
    const storage = this.owner.lookup('service:storage');

    storage.setKey('filters', {status: 'pending'});
    storage.setDeviceKey('browser-check-skip', {name: 'Chrome', version: '90'});

    assert.deepEqual(storage.getKey('filters'), {status: 'pending'});
    assert.deepEqual(storage.getDeviceKey('browser-check-skip'), {name: 'Chrome', version: '90'});

    assert.strictEqual(storage.getDeviceKey('filters'), undefined, 'device namespace does not see session keys');
    assert.strictEqual(storage.getKey('browser-check-skip'), undefined, 'session namespace does not see device keys');
  });

  test('clearStorage leaves device preferences alone', function (assert) {
    const storage = this.owner.lookup('service:storage');

    storage.setKey('filters', {status: 'pending'});
    storage.setDeviceKey('browser-check-skip', {name: 'Chrome', version: '90'});

    storage.clearStorage();

    assert.strictEqual(storage.getKey('filters'), undefined, 'the user preference is gone');
    assert.deepEqual(storage.getDeviceKey('browser-check-skip'), {name: 'Chrome', version: '90'},
      'the device preference survived logout');
  });

  test('setting a key to null deletes it', function (assert) {
    const storage = this.owner.lookup('service:storage');

    storage.setDeviceKey('browser-check-skip', {name: 'Chrome', version: '90'});
    storage.setDeviceKey('browser-check-skip', null);

    assert.strictEqual(storage.getDeviceKey('browser-check-skip'), undefined);
  });

  test('garbage in localStorage is ignored rather than thrown', function (assert) {
    const storage = this.owner.lookup('service:storage');

    window.localStorage.setItem(DEVICE_KEY, '{not json');

    assert.strictEqual(storage.getDeviceKey('browser-check-skip'), undefined);
  });
});
