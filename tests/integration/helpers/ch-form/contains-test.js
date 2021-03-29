import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | ch-form/contains', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('inputValue', '1234');
    this.set('expectedValue', '1234');

    await render(hbs`{{ch-form/contains this.expectedValue this.inputValue}}`);

    assert.dom(this.element).hasText('true');
  });

  test('it returns false', async function(assert) {
    this.set('inputValue', 'foo');
    this.set('expectedValue', 'bar');

    await render(hbs`{{ch-form/contains this.expectedValue this.inputValue}}`);

    assert.dom(this.element).hasText('false');
  });

  test('it accepts arrays', async function(assert) {
    this.set('inputValue', 'foo');
    this.set('expectedValue', ['bar', 'baz', 'foo']);

    await render(hbs`{{ch-form/contains this.expectedValue this.inputValue}}`);

    assert.dom(this.element).hasText('true');

    this.set('inputValue', 'qux');

    await render(hbs`{{ch-form/contains this.expectedValue this.inputValue}}`);

    assert.dom(this.element).hasText('false');
  });
});
