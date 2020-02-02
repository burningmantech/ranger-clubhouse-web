import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | photo-selfie', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(/*assert*/) {
    // The selfie requires hardware access Skip this for now.

    await render(hbs`<PhotoSelfie />`);
  });
});
