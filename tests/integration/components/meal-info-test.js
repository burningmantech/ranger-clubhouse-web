import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | meal-info', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders meal info', async function(assert) {
    this.set('eventInfo', { meals: {pre: true, event: true, post: false}, meals_status: 'claimed' });

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.notStrictEqual(this.element.textContent.trim().indexOf('You qualify for three meals/day'), -1, 'render pre+event');
  });

  test('it renders meal info with empty value', async function(assert) {
    this.set('eventInfo', { meals: {pre: false, event:false, post:false}, meals_status: '' });

    await render(hbs`<MealInfo @eventInfo={{this.eventInfo}} />`);

    assert.notStrictEqual(this.element.textContent.trim().indexOf('Pogs'), -1, 'render meal pogs');
  });
});
