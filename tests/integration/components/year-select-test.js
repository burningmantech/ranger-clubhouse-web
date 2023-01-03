import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | year select', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    this.set('year', 2019);
    this.set('years', [ 2017, 2018, 2019, 2020]);
    this.set('onChange', () => { });
    await render(hbs`<YearSelect @title="Silent All These Years" @year={{this.year}} @years={{this.years}} @onChange={{this.onChange}} />`);
    assert.dom('h1').hasText(/Silent All These Years/);
    assert.dom('options').exists({ exists: 4 });
  });
});
