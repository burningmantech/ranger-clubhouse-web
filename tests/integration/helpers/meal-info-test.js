
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:meal-info', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders meal info', async function(assert) {
    this.set('meal', 'pre+event');

    await render(hbs`{{meal-info meal}}`);

    assert.ok(this.element.textContent.trim().indexOf('You qualify for three meals/day') !== -1);
  });

  test('it renders meal info with null value', async function(assert) {
    this.set('meal', '');

    await render(hbs`{{meal-info meal}}`);

    assert.ok(this.element.textContent.trim().indexOf('Meal Pogs') !== -1);
  });

  test('it renders meal info with unknown value', async function(assert) {
    this.set('meal', 'something-something-darkside');

    await render(hbs`{{meal-info meal}}`);

    assert.ok(this.element.textContent.trim().indexOf('Unknown meal type') !== -1);
  });
});
