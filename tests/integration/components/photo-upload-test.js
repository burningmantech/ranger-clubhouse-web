import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | photo-upload', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { });
    this.set('refreshPhoto', () => {});
    this.set('closeAction', () => { });

    await render(hbs`<PhotoUpload @person={{this.person}} @refreshPhoto={{this.refreshPhoto}} @closeAction={{this.closeAction}} />`);

    assert.dom('.modal').exists();
  });
});
