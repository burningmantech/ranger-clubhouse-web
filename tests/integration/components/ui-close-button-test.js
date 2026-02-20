import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ui-close-button', function (hooks) {
  setupRenderingTest(hooks);

  test('defaults to gray type', async function (assert) {
    await render(hbs`<UiCloseButton @onClick={{this.noop}} />`);
    assert.dom('button').hasClass('btn-gray', 'defaults to btn-gray');
  });

  test('accepts a custom type', async function (assert) {
    await render(hbs`<UiCloseButton @type="secondary" @onClick={{this.noop}} />`);
    assert.dom('button').hasClass('btn-secondary', 'accepts custom type');
    assert.dom('button').doesNotHaveClass('btn-gray', 'does not use default gray when type provided');
  });

  test('renders Close label', async function (assert) {
    await render(hbs`<UiCloseButton @onClick={{this.noop}} />`);
    assert.dom('button').hasText('Close');
  });

  test('calls onClick when clicked', async function (assert) {
    this.set('handleClick', () => assert.ok(true, 'onClick called'));
    await render(hbs`<UiCloseButton @onClick={{this.handleClick}} />`);
    await click('button');
  });
});
