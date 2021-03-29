
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:mail-to', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    const email = 'dangerranger@ranger.bm';
    this.set('email',email);

    await render(hbs`{{mail-to this.email}}`);

    assert.dom('a').exists()
      .hasAttribute('href', `mailto:${email}`)
      .hasText(email);
  });
});
