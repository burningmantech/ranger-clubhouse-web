import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch sidebar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Template block usage:
    await render(hbs`<ChSidebar><div class="test-content">I'm a sidebar</div></ChSidebar>`);
    assert.dom('#sidebar-container').exists();
    assert.dom('div.test-content').hasText("I'm a sidebar");
  });
});
