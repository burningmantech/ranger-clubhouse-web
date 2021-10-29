import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | full-datetime-format', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('date', '2018-08-31 23:59:00');

    await render(hbs`{{full-datetime-format this.date}}`);

    assert.strictEqual(this.element.textContent.trim(), 'Friday, August 31st 2018 @ 23:59');
  });
});
