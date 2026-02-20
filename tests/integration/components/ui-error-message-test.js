import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ui-error-message', function (hooks) {
  setupRenderingTest(hooks);

  test('renders nothing when no error is provided', async function (assert) {
    await render(hbs`<UiErrorMessage />`);
    assert.dom('.alert').doesNotExist('renders nothing without error');
  });

  test('renders a single string error', async function (assert) {
    this.set('error', 'Something went wrong');
    await render(hbs`<UiErrorMessage @error={{this.error}} />`);
    assert.dom('.alert-danger').exists('renders danger alert');
    assert.dom('.alert-danger').includesText('Something went wrong');
  });

  test('renders multiple errors as a list', async function (assert) {
    this.set('errors', ['Error one', 'Error two', 'Error three']);
    await render(hbs`<UiErrorMessage @errors={{this.errors}} />`);
    assert.dom('.alert-danger ul li').exists({ count: 3 }, 'renders list of errors');
    assert.dom('.alert-danger ul li:first-child').hasText('Error one');
  });

  test('renders single item from errors array without list', async function (assert) {
    this.set('errors', ['Only one error']);
    await render(hbs`<UiErrorMessage @errors={{this.errors}} />`);
    assert.dom('.alert-danger').includesText('Only one error');
    assert.dom('.alert-danger ul').doesNotExist('no list for single error');
  });

  test('renders dismiss button when @onDismiss is provided', async function (assert) {
    this.set('error', 'Oops');
    this.set('dismissed', false);
    this.set('dismiss', () => this.set('dismissed', true));
    await render(hbs`<UiErrorMessage @error={{this.error}} @onDismiss={{this.dismiss}} />`);
    assert.dom('.btn-close').exists('renders dismiss button');
    await click('.btn-close');
    assert.true(this.dismissed, 'dismiss callback was called');
  });

  test('does not render dismiss button without @onDismiss', async function (assert) {
    this.set('error', 'Oops');
    await render(hbs`<UiErrorMessage @error={{this.error}} />`);
    assert.dom('.btn-close').doesNotExist('no dismiss button without @onDismiss');
  });
});
