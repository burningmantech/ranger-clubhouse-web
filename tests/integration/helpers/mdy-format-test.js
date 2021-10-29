import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | mdy-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('date', '2018-08-31 12:59:59');

    await render(hbs`{{mdy-format this.date}}`);

    assert.strictEqual(this.element.textContent.trim(), 'Aug 31, 2018');
  });

  test('it renders full month day year', async function(assert) {
    this.set('date', '2018-08-31 12:59:59');

    await render(hbs`{{mdy-format this.date full=true}}`);

    assert.strictEqual(this.element.textContent.trim(), 'Friday, August 31st 2018');
  });
});
