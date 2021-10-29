import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | mentor-short-status', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('inputValue', 'bonked');

    await render(hbs`{{mentor-short-status this.inputValue}}`);

    assert.strictEqual(this.element.textContent.trim(), 'B');
  });
});
