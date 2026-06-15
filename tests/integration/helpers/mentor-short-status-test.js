import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Helper | mentor-short-status', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('inputValue', 'bonked');

    await render(hbs`{{mentor-short-status this.inputValue}}`);

    assert.strictEqual(this.element.textContent.trim(), 'B');
  });
});
