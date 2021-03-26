import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | online-training-launch', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { id: 1, callsign: 'hubcap' });
    this.set('url', 'https://example.com');

    await render(hbs`<OnlineTrainingLaunch  @text="Click Here" @person={{this.person}} @url={{this.url}}/>`);

    assert.dom('a').hasText('Click Here');
  });
});
