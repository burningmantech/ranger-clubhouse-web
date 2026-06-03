import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Helper | hour-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it formats a duration in seconds as hours with two decimals', async function(assert) {
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

  test('it returns 0.00 for a zero duration', async function(assert) {
    this.set('seconds', 0);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '0.00');
  });

  test('it formats a negative duration', async function(assert) {
    this.set('seconds', -3600);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '-1.00');
  });

  test('it returns 0.00 for null and undefined input', async function(assert) {
    this.set('seconds', null);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '0.00');

    this.set('seconds', undefined);
    await render(hbs`{{hour-format this.seconds}}`);
    assert.strictEqual(this.element.textContent.trim(), '0.00');
  });
});
