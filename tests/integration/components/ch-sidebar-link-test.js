import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch sidebar link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{ch-sidebar-link}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#ch-sidebar-link}}
        template block text
      {{/ch-sidebar-link}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
