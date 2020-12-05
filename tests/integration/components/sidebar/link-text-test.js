import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sidebar/link-text', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Sidebar::LinkText @route="me.homepage" @title="heya"/>`);

    assert.dom('span.sidebar-link-text').exists().hasText('heya');
  });
});
