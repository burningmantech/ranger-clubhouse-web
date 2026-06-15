import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | ui-edit-button', function (hooks) {
  setupRenderingTest(hooks);

  test('defaults to secondary type', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiEditButton @onClick={{this.onClick}} />`);
    assert.dom('button').hasClass('btn-secondary', 'defaults to btn-secondary');
  });

  test('accepts a custom type', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiEditButton @type="primary" @onClick={{this.onClick}} />`);
    assert.dom('button').hasClass('btn-primary', 'accepts custom type');
    assert.dom('button').doesNotHaveClass('btn-secondary', 'does not use default secondary when type provided');
  });

  test('renders the Edit label by default', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiEditButton @onClick={{this.onClick}} />`);
    assert.dom('button').includesText('Edit');
    assert.dom('button i.fa-edit').exists('renders the edit icon');
  });

  test('renders block content in place of the default label', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiEditButton @onClick={{this.onClick}}>Custom Label</UiEditButton>`);
    assert.dom('button').includesText('Custom Label');
    assert.dom('button').doesNotIncludeText('Edit', 'block content replaces default Edit label');
  });

  test('calls onClick when clicked', async function (assert) {
    this.onClick = spy();
    await render(hbs`<UiEditButton @onClick={{this.onClick}} />`);
    await click('button');
    assert.true(this.onClick.called, 'onClick fired');
  });
});
