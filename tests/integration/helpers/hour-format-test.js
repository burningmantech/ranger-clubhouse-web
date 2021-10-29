import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | hour-format', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('seconds', 3600);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '1.00');


    this.set('seconds', 3636);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '1.01');

    this.set('seconds', 5400);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '1.50');
  });
});
