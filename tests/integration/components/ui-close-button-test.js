import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | ui-close-button', function (hooks) {
  setupRenderingTest(hooks);

  test('defaults to gray type', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiCloseButton @onClick={{this.onClick}} />`);
    assert.dom('button').hasClass('btn-gray', 'defaults to btn-gray');
  });

  test('accepts a custom type', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiCloseButton @type="secondary" @onClick={{this.onClick}} />`);
    assert.dom('button').hasClass('btn-secondary', 'accepts custom type');
    assert.dom('button').doesNotHaveClass('btn-gray', 'does not use default gray when type provided');
  });

  test('renders the Close label', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiCloseButton @onClick={{this.onClick}} />`);
    assert.dom('button').hasText('Close');
  });

  test('calls onClick when clicked', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiCloseButton @onClick={{this.onClick}} />`);
    await click('button');
    assert.true(this.onClick.called, 'onClick fired');
  });
});
