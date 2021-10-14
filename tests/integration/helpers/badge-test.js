
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:badge', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders type', async function(assert) {
    await render(hbs`{{badge "danger" "badge text" }}`);

    assert.dom('span.badge.bg-danger').exists();
    assert.dom('span.badge').hasText('badge text');
  });
});
