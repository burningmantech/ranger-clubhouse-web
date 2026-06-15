import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('helper:hour-minute-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('duration', 7300);

    await render(hbs`{{hour-minute-format this.duration}}`);

    assert.dom('span[aria-hidden="true"]').hasText('2:01');
    assert.dom('span.sr-only').hasText('2 hours 1 minute');
  });
});
