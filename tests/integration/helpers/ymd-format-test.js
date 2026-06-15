import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Helper | ymd-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('date', '2019-08-25 12:12:12');

    await render(hbs`{{ymd-format this.date}}`);

    assert.strictEqual(this.element.textContent.trim(), '2019-08-25');
  });
});
