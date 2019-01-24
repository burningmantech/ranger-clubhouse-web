import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | schedule-manage', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{schedule-manage}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#schedule-manage}}
        template block text
      {{/schedule-manage}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
