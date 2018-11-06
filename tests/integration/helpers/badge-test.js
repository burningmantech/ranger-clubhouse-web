
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:badge', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders default', async function(assert) {
    this.set('inputValue', 'active');

    await render(hbs`{{badge inputValue}}`);

    assert.equal(this.$().html, '<span class="badge badge-success">active</span>');
  });

  // Replace this with your real tests.
  test('it renders type', async function(assert) {
    this.set('inputValue', 'active');

    await render(hbs`{{badge inputValue type="danger"}}`);

    assert.equal(this.$().html, '<span class="badge badge-danger">active</span>');
  });
});
