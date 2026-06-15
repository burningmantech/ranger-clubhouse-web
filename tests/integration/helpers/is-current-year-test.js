import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Helper | is-current-year', function(hooks) {
  setupRenderingTest(hooks);

  test('it returns false for a year that is not the current year', async function(assert) {
    const notCurrentYear = new Date().getFullYear() - 1;
    this.set('year', notCurrentYear);

    await render(hbs`{{is-current-year this.year}}`);
    assert.strictEqual(this.element.textContent.trim(), 'false');
  });

  test('it returns true for the current year as a number', async function(assert) {
    this.set('year', new Date().getFullYear());

    await render(hbs`{{is-current-year this.year}}`);
    assert.strictEqual(this.element.textContent.trim(), 'true');
  });

  test('it coerces a string year via loose comparison', async function(assert) {
    this.set('year', String(new Date().getFullYear()));

    await render(hbs`{{is-current-year this.year}}`);
    assert.strictEqual(this.element.textContent.trim(), 'true');
  });
});
