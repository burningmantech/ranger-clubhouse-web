import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | present or not', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders a present value', async function(assert) {
    this.set('value', 'something');

    await render(hbs`<PresentOrNot @value={{this.value}} />`);

    assert.dom('*').hasText('something');
  });

  skip('it renders a not present/empty value', async function(assert) {
    this.set('value', '');

    await render(hbs`<PresentOrNot @value={{this.value}} />`);

    assert.equal(find('*').innerHTML.trim(), '<i>not given</i>');
  });
});
