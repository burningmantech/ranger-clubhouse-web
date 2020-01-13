import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch-sidebar-link-content', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Template block usage:
    await render(hbs`<ChSidebarLinkContent @title="I haz content" />`);
    assert.dom('span.menu-collapsed').hasText('I haz content');
  });
});
