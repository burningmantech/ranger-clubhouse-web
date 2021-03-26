import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | person-photo', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { id: 1, callsign: 'hubcap'});
    this.set('photo', { photo_status: 'approved', photo_url: 'https://example.com/1.jpg'});
    await render(hbs`<PersonPhoto @photo={{this.photo}} @person={{this.person}} />`);

    assert.dom('img').exists().hasProperty('src', 'https://example.com/1.jpg');

  });
});
