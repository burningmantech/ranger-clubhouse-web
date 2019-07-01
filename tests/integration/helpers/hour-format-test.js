import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | hour-format', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('seconds', 3600);

    await render(hbs`{{hour-format seconds}}`);

    assert.equal(this.element.textContent.trim(), '1.0');

    this.set('seconds', 5400);

    await render(hbs`{{hour-format seconds}}`);

    assert.equal(this.element.textContent.trim(), '1.5');
  });
});
