import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ui-edit-button', function (hooks) {
  setupRenderingTest(hooks);

  test('defaults to secondary type', async function (assert) {
    await render(hbs`<UiEditButton @onClick={{this.noop}} />`);
    assert.dom('button').hasClass('btn-secondary', 'defaults to btn-secondary');
  });

  test('accepts a custom type', async function (assert) {
    await render(hbs`<UiEditButton @type="primary" @onClick={{this.noop}} />`);
    assert.dom('button').hasClass('btn-primary', 'accepts custom type');
    assert.dom('button').doesNotHaveClass('btn-secondary', 'does not use default secondary when type provided');
  });

  test('renders Edit label by default', async function (assert) {
    await render(hbs`<UiEditButton @onClick={{this.noop}} />`);
    assert.dom('button').includesText('Edit');
  });

  test('renders block content when provided', async function (assert) {
    await render(hbs`<UiEditButton @onClick={{this.noop}}>Custom Label</UiEditButton>`);
    assert.dom('button').includesText('Custom Label');
  });

  test('calls onClick when clicked', async function (assert) {
    assert.expect(1);
    this.set('handleClick', () => assert.ok(true, 'onClick called'));
    await render(hbs`<UiEditButton @onClick={{this.handleClick}} />`);
    await click('button');
  });
});
