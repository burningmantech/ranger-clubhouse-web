import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | photo-edit', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the edit container, the source image, and the submit/cancel controls', async function (assert) {
    const imageDataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    this.set('imageDataUrl', imageDataUrl);
    this.submitAction = spy();
    this.cancelAction = spy();

    await render(hbs`<PhotoEdit
      @imageDataUrl={{this.imageDataUrl}}
      @submitAction={{this.submitAction}}
      @cancelAction={{this.cancelAction}}
      @isMugshot={{true}}
      @height={{100}}
      @width={{100}} />`);

    // The crop container and the image (with the bound, non-undefined src) are present.
    assert.dom('#mugshot-edit-container').exists('the crop container renders');
    assert.dom('#photo-edit-image').hasAttribute('src', imageDataUrl, 'the image src is bound to @imageDataUrl');

    // The mugshot oval instructions render because @isMugshot is true.
    assert.dom('.h4.text-center').includesText('FITS IN', 'the mugshot framing instructions render');

    // A Retake (cancel) button renders because @cancelAction is supplied, alongside Submit.
    assert.dom('.mt-2.text-center').includesText('Retake', 'the Retake button renders');
    assert.dom('.mt-2.text-center').includesText('Submit', 'the Submit button renders');
  });
});
