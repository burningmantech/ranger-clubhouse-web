import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch sidebar link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Template block usage:
    await render(hbs`<ChSidebarLink @route="me.overview" @title="Me Overview" @icon="check" />`);
    assert.dom('a').exists();
    assert.dom('a').hasText('Me Overview');
  });
});
