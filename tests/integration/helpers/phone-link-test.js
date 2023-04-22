
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:phone-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a phone link', async function(assert) {
    const phone = '415-555-1212';
    this.set('phone', phone);

    await render(hbs`{{phone-link this.phone}}`);

    assert.dom('a').hasAttribute('href', `tel:${phone}`).hasText(phone);
  });
});
