import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | ticket-faq', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('ticketingInfo', {faqs: {wap: 'https://example.com/wap.html'}});
    await render(hbs`<TicketFaq @ticketingInfo={{this.ticketingInfo}}  @topic="wap"/>`);

    assert.dom('a').hasProperty('href', 'https://example.com/wap.html').hasText(/Work Access Passes/);
  });
});
