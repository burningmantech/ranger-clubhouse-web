import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | ymd-format', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('date', '2019-08-25 12:12:12');

    await render(hbs`{{ymd-format this.date}}`);

    assert.strictEqual(this.element.textContent.trim(), '2019-08-25');
  });
});
