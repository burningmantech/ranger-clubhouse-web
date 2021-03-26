import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | datetime-picker', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    await render(hbs`<DatetimePicker />`);

    assert.dom(this.element).hasText('');
  });
});
