import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | photo-info', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the photo metadata (id, callsign, status, dimensions, dates)', async function (assert) {
    this.set('photo', {
      id: 9999,
      status: 'approved',
      width: 350,
      height: 450,
      image_url: 'http://example.com/test.jpg',
      person: {id: 9999, callsign: 'Hubcap'},
      uploaded_at: '2020-01-02 12:34:56',
    });
    this.closeAction = spy();

    await render(hbs`<PhotoInfo @photo={{this.photo}} @closeAction={{this.closeAction}} />`);

    // Heading: "ID #9999 - Hubcap"
    assert.dom('h3').hasText('ID #9999 - Hubcap', 'the heading shows the photo id and callsign');

    // The definition list renders the labels and the photo's values.
    const terms = [...this.element.querySelectorAll('dl dt')].map((dt) => dt.textContent.trim());
    assert.deepEqual(
      terms,
      ['Status', 'Dimensions (WxH)', 'Uploaded', 'Reviewed', 'Edited'],
      'the metadata labels render in order'
    );

    const defs = [...this.element.querySelectorAll('dl dd')];
    assert.dom(defs[0]).hasText('approved', 'the status value renders');
    assert.dom(defs[1]).hasText('350 x 450', 'the dimensions value renders');
    assert.dom(defs[2]).includesText('2020-01-02 12:34:56', 'the uploaded-at date renders');

    // No reviewed_at / edited_at supplied -> those render "never".
    assert.dom(defs[3]).hasText('never', 'the reviewed value falls back to "never"');
    assert.dom(defs[4]).hasText('never', 'the edited value falls back to "never"');
  });
});
