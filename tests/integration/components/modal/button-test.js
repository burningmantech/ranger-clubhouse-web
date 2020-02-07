import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | modal/button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('action', () => { });
    await render(hbs`<Modal::Button @label="Click Me" @action={{this.action}} @type="info"/>`);

    assert.dom('button').exists();
    assert.dom('button').hasText('Click Me');
    assert.dom('button').hasClass('btn-info');
  });
});
