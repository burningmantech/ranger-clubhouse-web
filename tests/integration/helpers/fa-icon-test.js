
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:fa-icon', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it render icons', async function(assert) {
    await render(hbs`{{fa-icon 'clock'}}`);

    assert.equal(find('*').innerHTML, '<i class="fas fa-clock "></i>');

    await render(hbs`{{fa-icon 'clock' size='lg'}}`);
    assert.equal(find('*').innerHTML, '<i class="fas fa-clock fa-lg"></i>');

  });
});
