import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ch-accordion-title', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('onClick', () => {});
    await render(hbs`<ChAccordionTitle @onClick={{this.onClick}}>My Title</ChAccordionTitle>`);

    assert.dom('div.accordion-title').exists().hasText('My Title');
  });
});
