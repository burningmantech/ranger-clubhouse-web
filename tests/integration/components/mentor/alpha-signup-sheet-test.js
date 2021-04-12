import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | mentor/alpha-signup-sheet', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('slot', { people: [ ] });
    await render(hbs`<Mentor::AlphaSignupSheet @slot={{this.slot}} />`);

    assert.dom('div').exists();
  });
});
