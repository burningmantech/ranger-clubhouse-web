import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Helper | options-get', function(hooks) {
  setupRenderingTest(hooks);

  test('it returns the label for a matching value in [label, value] form', async function(assert) {
    this.set('options', [
      [ 'Hi', 1 ],
      [ 'Bye', 2 ],
    ]);

    await render(hbs`{{options-get this.options 2}}`);
    assert.strictEqual(this.element.textContent.trim(), 'Bye');
  });

  test('it returns the lookup value when no option matches', async function(assert) {
    this.set('options', [
      [ 'Hi', 1 ],
      [ 'Bye', 2 ],
    ]);

    await render(hbs`{{options-get this.options 33}}`);
    assert.strictEqual(this.element.textContent.trim(), '33');
  });

  test('it returns the title for a matching id in object form', async function(assert) {
    this.set('options', [
      { id: 1, title: 'Alpha' },
      { id: 2, title: 'Beta' },
    ]);

    await render(hbs`{{options-get this.options 2}}`);
    assert.strictEqual(this.element.textContent.trim(), 'Beta');
  });

  test('it treats a scalar option as both label and value', async function(assert) {
    this.set('options', [ 'red', 'green', 'blue' ]);

    await render(hbs`{{options-get this.options "green"}}`);
    assert.strictEqual(this.element.textContent.trim(), 'green');

    await render(hbs`{{options-get this.options "purple"}}`);
    assert.strictEqual(this.element.textContent.trim(), 'purple');
  });

  test('it matches loosely with == so a string lookup finds a numeric value', async function(assert) {
    this.set('options', [
      [ 'Hi', 1 ],
      [ 'Bye', 2 ],
    ]);

    await render(hbs`{{options-get this.options "2"}}`);
    assert.strictEqual(this.element.textContent.trim(), 'Bye');
  });
});
