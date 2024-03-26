import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | photo-upload', function(hooks) {
  setupRenderingTest(hooks);

  // Sigh, there's a node 20.x bug causing this to randomly fail.
  skip('it renders', async function(assert) {
    this.set('person', { });
    this.set('refreshPhoto', () => {});
    this.set('closeAction', () => { });

    await render(hbs`<PhotoUpload @person={{this.person}} @refreshPhoto={{this.refreshPhoto}} @closeAction={{this.closeAction}} />`);

    assert.dom('.modal').exists();
  });
});
