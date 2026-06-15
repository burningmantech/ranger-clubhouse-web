import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('helper:credits-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('credits', 12);

    await render(hbs`{{credits-format this.credits}}`);

    assert.strictEqual(this.element.textContent.trim(), '12.00');
  });
});
