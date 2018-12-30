import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | slot-info-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with info link', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('description', 'Swing');
    this.set('info', 'Women of Khaki');

    await render(hbs`{{slot-info-link description=description info=info}}`);

    assert.dom('a').hasText(' Swing');
    assert.dom('a i.fas').hasClass('fa-info-circle');
  });

  test('it renders without info link', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('description', 'Man Burn');

    await render(hbs`{{slot-info-link description=description}}`);

    assert.dom(this.element).hasText('Man Burn');
    assert.dom('a .fa-info-circle').doesNotExist();
  });
});
