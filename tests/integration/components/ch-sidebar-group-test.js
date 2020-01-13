import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch sidebar group', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<ChSidebarGroup @title="I haz title">template block text</ChSidebarGroup>`);

    // component will uppercase the title
    assert.dom('li').hasText('I HAZ TITLE');
  });
});
