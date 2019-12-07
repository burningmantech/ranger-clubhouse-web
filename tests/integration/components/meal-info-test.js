import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | meal-info', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders meal info', async function(assert) {
    this.set('meals', 'pre+event');

    await render(hbs`<MealInfo @meals={{this.meals}} />`);

    assert.ok(this.element.textContent.trim().indexOf('You qualify for three meals/day') !== -1, 'render pre+event');
  });

  test('it renders meal info with null value', async function(assert) {
    this.set('meals', '');

    await render(hbs`<MealInfo @meals={{this.meals}} />`);

    assert.ok(this.element.textContent.trim().indexOf('Meal Pogs') !== -1, 'render meal pogs');
  });

  test('it renders meal info with unknown value', async function(assert) {
    this.set('meals', 'something-something-darkside');

    await render(hbs`<MealInfo @meals={{this.meals}} />`);

    assert.ok(this.element.textContent.trim().indexOf('Unknown meal type') !== -1, 'render unknown status');
  });
});
