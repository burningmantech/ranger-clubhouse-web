import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | person/emergency-contact', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{person/emergency-contact}}`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      {{#person/emergency-contact}}
        template block text
      {{/person/emergency-contact}}
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
