import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Component | ticket-info', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<TicketInfo />`);

    assert.dom(this.element).hasText('');
  });
});
