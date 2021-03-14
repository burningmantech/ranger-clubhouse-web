import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading-dialog', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('message', 'stuff');
    await render(hbs`<LoadingDialog @item={{message}} />`);

    assert.dom('div.loading-pane').exists();
    assert.dom('div.loading-text').includesText("First, do nothing. We're loading stuff");

    const text = 'Loading all up in your grill!';
    this.set('custom', text)
    await render(hbs`<LoadingDialog @text={{custom}} />`);

    assert.dom('div.loading-pane').exists();
    assert.dom('div.loading-text').includesText(text);
  });
});
