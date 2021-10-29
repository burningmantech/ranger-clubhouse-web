import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | time-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('time', '2018-08-08 12:34:56');

    await render(hbs`{{time-format this.time}}`);

    assert.strictEqual(this.element.textContent.trim(), '12:34');
  });
});
