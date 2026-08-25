import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

const DEVICE_KEY = 'clubhouse-device';

// Stand in for the real BrowserDetector so the test does not depend on the
// browser the suite happens to be running under.
function stubBrowser(owner, {name = 'Chrome', version = '90', isSupported = false} = {}) {
  const session = owner.lookup('service:session');

  session.browserDetect = {
    browser: {name, version},
    isSupported: () => isSupported,
  };

  return session;
}

module('Unit | Controller | application', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    window.localStorage.removeItem(DEVICE_KEY);
  });

  hooks.afterEach(function () {
    window.localStorage.removeItem(DEVICE_KEY);
  });

  test('an unsupported browser is warned about', function (assert) {
    stubBrowser(this.owner);

    assert.true(this.owner.lookup('controller:application').showBrowserNotSupported);
  });

  test('a supported browser is not warned about', function (assert) {
    stubBrowser(this.owner, {version: '999', isSupported: true});

    assert.false(this.owner.lookup('controller:application').showBrowserNotSupported);
  });

  test('closing the warning only records the skip when the box is checked', function (assert) {
    stubBrowser(this.owner);
    const storage = this.owner.lookup('service:storage');
    const controller = this.owner.lookup('controller:application');

    controller.closeBrowserNotSupported();

    assert.false(controller.showBrowserNotSupported, 'the dialog closed');
    assert.strictEqual(storage.getDeviceKey('browser-check-skip'), undefined, 'nothing was recorded');

    controller.showBrowserNotSupported = true;
    controller.toggleSkipBrowserCheck({target: {checked: true}});
    controller.closeBrowserNotSupported();

    assert.deepEqual(storage.getDeviceKey('browser-check-skip'), {name: 'Chrome', version: '90'});
  });

  test('a skipped browser is not warned about on the next visit', function (assert) {
    stubBrowser(this.owner);
    this.owner.lookup('service:storage').setDeviceKey('browser-check-skip', {name: 'Chrome', version: '90'});

    assert.false(this.owner.lookup('controller:application').showBrowserNotSupported);
  });

  test('skipping one browser does not silence another', function (assert) {
    stubBrowser(this.owner, {name: 'Firefox', version: '80'});
    this.owner.lookup('service:storage').setDeviceKey('browser-check-skip', {name: 'Chrome', version: '90'});

    assert.true(this.owner.lookup('controller:application').showBrowserNotSupported);
  });

  test('skipping one version does not silence an older version of the same browser', function (assert) {
    stubBrowser(this.owner, {version: '85'});
    this.owner.lookup('service:storage').setDeviceKey('browser-check-skip', {name: 'Chrome', version: '90'});

    assert.true(this.owner.lookup('controller:application').showBrowserNotSupported);
  });
});
