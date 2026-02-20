import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ui-loading', function (hooks) {
  setupRenderingTest(hooks);

  module('inline variant', function () {
    test('renders inline by default', async function (assert) {
      await render(hbs`<UiLoading />`);
      assert.dom('span.d-inline-block').exists('renders an inline span');
    });

    test('renders default text', async function (assert) {
      await render(hbs`<UiLoading />`);
      assert.dom('span').includesText('Loading');
    });

    test('renders custom text', async function (assert) {
      await render(hbs`<UiLoading @text="Saving" />`);
      assert.dom('span').includesText('Saving');
    });

    test('has aria-live attribute', async function (assert) {
      await render(hbs`<UiLoading @variant="inline" />`);
      assert.dom('span.d-inline-block').hasAttribute('aria-live', 'polite');
    });
  });

  module('section variant', function () {
    test('renders loading-pane div', async function (assert) {
      await render(hbs`<UiLoading @variant="section" />`);
      assert.dom('.loading-pane').exists('renders .loading-pane');
      assert.dom('.loading-text').exists('renders .loading-text');
      assert.dom('.loading-spinner').exists('renders .loading-spinner');
    });

    test('renders custom text in section', async function (assert) {
      await render(hbs`<UiLoading @variant="section" @text="Fetching data" />`);
      assert.dom('.loading-text').hasText('Fetching data');
    });

    test('has aria-live attribute', async function (assert) {
      await render(hbs`<UiLoading @variant="section" />`);
      assert.dom('.loading-pane').hasAttribute('aria-live', 'polite');
    });
  });
});
