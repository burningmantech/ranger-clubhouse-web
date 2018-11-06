
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:phone-link', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a phone link', async function(assert) {
    const phoneNumber = '1-800-BURN-ME';
    this.set('phone', phoneNumber);

    await render(hbs`{{phone-link phone}}`);

    assert.equal(find('*').innerHTML, `<a href="tel:${phoneNumber}">${phoneNumber}</a>`);
  });
});
