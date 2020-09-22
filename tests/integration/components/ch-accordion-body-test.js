import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ch-accordion-body', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('onInsert', () => {});
    await render(hbs`<ChAccordionBody @onInsert={{this.onInsert}}>My Text</ChAccordionBody>`);

    assert.dom('div.accordion-body').exists().hasText('My Text');
  });
});
