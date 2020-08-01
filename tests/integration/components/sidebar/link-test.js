import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | sidebar/link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Sidebar::Link @route="me.overview" @title="Back to home"/>`);

    assert.dom('a').exists();
    assert.dom('a span.menu-collapsed').exists().hasText(/Back to home/);
  });
});
