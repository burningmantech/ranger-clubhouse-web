import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | email-list', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
     await render(hbs`<EmailList />`);

    assert.dom(this.element).hasText('');

  });
});
