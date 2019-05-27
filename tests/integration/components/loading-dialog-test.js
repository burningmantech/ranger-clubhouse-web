import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading-dialog', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('message', 'stuff');
    await render(hbs`{{loading-dialog message=message}}`);

    assert.dom('div.loading-pane').exists();
    assert.dom('div.loading-message').includesText("First, do nothing. We're loading stuff");
  });
});
