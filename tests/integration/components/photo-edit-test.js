import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | photo-edit', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('imageDataUrl', '');
    this.set('uploadAction', () => { });
    this.set('cancelAction', () => { });

    await render(hbs`<PhotoEdit @imageDataUrl={{this.imageDatUrl}} @uploadAction={{this.uploadAction}} @cancelAction={{this.cancelAction}} @height={{100}} @width={{100}}/>`);

    assert.dom('#mugshot-edit-container').exists();
  });
});
