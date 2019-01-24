import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch-form/checkbox-group', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{ch-form/checkbox-group}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#ch-form/checkbox-group}}
        template block text
      {{/ch-form/checkbox-group}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
