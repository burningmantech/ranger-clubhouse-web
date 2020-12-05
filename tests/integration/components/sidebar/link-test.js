import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sidebar/link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Sidebar::Link @route="me.homepage" @title="Back to home"/>`);

    assert.dom('a.sidebar-link').exists();
    assert.dom('a span.sidebar-link-text').exists().hasText(/Back to home/);
  });
});
