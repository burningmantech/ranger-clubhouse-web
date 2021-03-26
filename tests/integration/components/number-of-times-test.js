import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | number-of-times', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
      // Template block usage:
    await render(hbs`
      <NumberOfTimes @times={{3}} as |idx|>
        <div data-test-id="{{idx}}">text #{{idx}}</div>
      </NumberOfTimes>
    `);

    assert.dom('[data-test-id="0"]').exists().hasText(/text #0/);
    assert.dom('[data-test-id="1"]').exists().hasText(/text #1/);
    assert.dom('[data-test-id="2"]').exists().hasText(/text #2/);
  });
});
