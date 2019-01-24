import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch sidebar group', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{ch-sidebar-group}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#ch-sidebar-group}}
        template block text
      {{/ch-sidebar-group}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
