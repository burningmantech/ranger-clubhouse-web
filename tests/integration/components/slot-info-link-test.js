import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | slot-info-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{slot-info-link}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#slot-info-link}}
        template block text
      {{/slot-info-link}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
