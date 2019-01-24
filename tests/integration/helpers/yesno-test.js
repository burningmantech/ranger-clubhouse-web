import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | yesno', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('value', true);

    await render(hbs`{{yesno value}}`);

    assert.dom(this.element).hasText('Y');

    this.set('value', false);

    await render(hbs`{{yesno value}}`);

    assert.dom(this.element).hasText('N');
  });
});
