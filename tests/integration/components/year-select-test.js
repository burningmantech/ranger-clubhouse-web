import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | year select', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{year-select}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#year-select}}
        template block text
      {{/year-select}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
