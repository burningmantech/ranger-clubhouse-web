import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | intake-ranking', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<div id="intake-rank-test"><IntakeRanking @type="training" @rank=2 /></div>`);
    assert.dom('div#intake-rank-test').hasText('2/Normal');
  });
});
