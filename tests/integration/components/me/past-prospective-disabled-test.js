import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | me/past prospective disabled', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { callsign: 'prospectivus'});

    await render(hbs`{{me/past-prospective-disabled person=person}}`);
    assert.dom('div.card').hasText(/Account Is Disabled/);
  });
});
