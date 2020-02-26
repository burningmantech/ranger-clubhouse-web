import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | photo-table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('photos', [
      { image_url: 'http://example.com/test.jpg', person: { id: 9999, callsign: 'test' } }
    ])
    await render(hbs`<PhotoTable @photos={{this.photos}}/>`);

    assert.dom('table').exists();
    assert.dom('table tbody tr').exists({ count: 1});
  });
});
