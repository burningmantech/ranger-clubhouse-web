import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | schedule-table', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{schedule-table}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#schedule-table}}
        template block text
      {{/schedule-table}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
