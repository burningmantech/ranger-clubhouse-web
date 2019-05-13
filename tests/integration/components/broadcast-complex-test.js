import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | broadcast-complex', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('config', { });
    this.set('broadcast', { has_status: 1 } );
    this.set('type', 'general')
    await render(hbs`{{broadcast-complex config=config type=type broadcast=broadcast}}`);

    assert.dom('form').exists();
  });
});
