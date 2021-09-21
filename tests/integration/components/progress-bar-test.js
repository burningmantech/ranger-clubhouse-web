import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | progress-bar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<ProgressBar @width={{55}} @text="hiya"/>`);

    assert.dom('.progress span').exists().hasText('hiya');
   });
});
