import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | slot-info-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with info link', async function(assert) {
     this.set('description', 'Swing');
    this.set('info', 'Women of Khaki');

    await render(hbs`<SlotInfoLink @description={{this.description}} @info={{this.info}} />`);

    assert.dom('a').hasText(' Swing');
    assert.dom('a i.fas').hasClass('fa-question-circle');
  });

  test('it renders without info link', async function(assert) {
     this.set('description', 'Man Burn');

    await render(hbs`<SlotInfoLink @description={{this.description}} />`);

    assert.dom(this.element).hasText('Man Burn');
    assert.dom('a .fa-info-circle').doesNotExist();
  });
});
