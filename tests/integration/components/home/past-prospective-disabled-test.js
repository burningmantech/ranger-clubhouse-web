import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | home/past prospective disabled', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{home/past-prospective-disabled}}`);
    assert.ok(find('div.card_header').textContent.trim().indexOf('Account Is Inactive'));
  });
});
