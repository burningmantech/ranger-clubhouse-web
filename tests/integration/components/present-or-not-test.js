import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | present or not', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a present value', async function(assert) {
    this.set('value', 'something');

    await render(hbs`{{present-or-not value}}`);

    assert.dom('*').hasText('something');
  });

  test('it renders a not present/empty value', async function(assert) {
    this.set('value', '');

    await render(hbs`{{present-or-not value}}`);

    assert.equal(find('*').innerHTML.trim(), '<i>not given</i>');
  });
});
