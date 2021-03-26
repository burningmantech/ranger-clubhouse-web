import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | person-link', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    this.set('person', { id: 1, callsign: 'hubcap'});
    await render(hbs`<PersonLink @person={{this.person}} />`);

    assert.dom('a').exists().hasText(/hubcap/);
  });
});
