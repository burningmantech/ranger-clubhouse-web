import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | me/needs photo', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const uploadUrl = 'https://upload.local/upload';

    this.set('photo', { upload_url: uploadUrl });
    this.set('person', { })
    await render(hbs`{{me/needs-photo photo=photo person=person}}`);

    assert.dom(`a[href="${uploadUrl}"]`).exists();
  });
});
