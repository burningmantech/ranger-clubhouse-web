import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import ENV from 'clubhouse/config/environment';

module('Integration | Helper | setting', function (hooks) {
  setupRenderingTest(hooks);

  // The helper reads the shared ENV.clientConfig global; capture and restore it
  // so these tests cannot leak state into the rest of the (randomized) suite.
  let originalClientConfig;

  hooks.beforeEach(function () {
    originalClientConfig = ENV.clientConfig;
  });

  hooks.afterEach(function () {
    ENV.clientConfig = originalClientConfig;
  });

  test('it should find setting', async function (assert) {
    ENV.clientConfig = {parent: 'rick'};

    await render(hbs`{{setting 'parent'}}`);

    assert.strictEqual(this.element.textContent.trim(), 'rick');
  });

  test('it should not find config', async function (assert) {
    ENV.clientConfig = {};

    await render(hbs`{{setting 'parent'}}`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
