import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | is-current-year', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {

    await render(hbs`{{is-current-year 1902}}`);

    assert.strictEqual(this.element.textContent.trim(), 'false');

    this.set('year', (new Date()).getFullYear());
    await render(hbs`{{is-current-year this.year}}`);

    assert.strictEqual(this.element.textContent.trim(), 'true');
  });
});
