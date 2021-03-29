import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | nl2br', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('inputValue', "Hello handsome!\nGoodbye");

    await render(hbs`{{nl2br this.inputValue}}`);
    assert.dom('br').exists();
  });
});
