import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | photo-info', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('photo', {
      id: 9999,
      image_url: 'http://exmample.com/test.jpg',
      person: {id: 9999, callsign: 'Hubcap'},
      uploaded_at: '2020-01-02 12:34:56',
    });
    this.set('closeAction', () => { });
    await render(hbs`<PhotoInfo @photo={{this.photo}} @closeAction={{this.closeAction}} />`);

    assert.dom('dt').exists();
  });
});
