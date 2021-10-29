import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | options-get', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    const options = [
      [ 'Hi', 1 ],
      [ 'Bye', 2 ],
    ];

    this.set('options', options);

    await render(hbs`{{options-get this.options 2}}`);

    assert.strictEqual(this.element.textContent.trim(), 'Bye');

    await render(hbs`{{options-get this.options 33}}`);
    assert.strictEqual(this.element.textContent.trim(), '33');
  });
});
