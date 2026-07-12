import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import TicketPackage from 'clubhouse/utils/ticket-package';
import {WAPSO, QUALIFIED, CLAIMED} from 'clubhouse/models/access-document';

function buildPackage(owner, accessDocuments) {
  const storePayload = owner.lookup('service:store-payload');
  const pkg = {
    access_documents: accessDocuments,
    gift_items: [],
    lsd_items: [],
    provision_records: [],
    provisions: null,
    provisions_bankable: false,
    provisions_banked: false,
  };
  return new TicketPackage(pkg, 1, storePayload);
}

module('Integration | Component | ticket-overview', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.person = {email: 'ranger@example.com', first_name: 'Test', last_name: 'Ranger'};
  });

  test('a qualified-only SO SAP is NOT shown as claimed', async function (assert) {
    this.ticketPackage = buildPackage(this.owner, [
      {
        id: '211829', person_id: 1, type: WAPSO, status: QUALIFIED,
        name: 'Pat Partner', access_date: '2026-08-26 00:01:00', access_any_time: false,
      },
    ]);

    await render(hbs`<TicketOverview @ticketPackage={{this.ticketPackage}} @person={{this.person}} />`);

    assert.dom(this.element).includesText('No SAPs For Significant Others');
    assert.dom(this.element).doesNotIncludeText('SAPs For Significant Other Claimed');
    // The claimed card lists the SO name; make sure it is not rendered.
    assert.dom(this.element).doesNotIncludeText('Pat Partner');
  });

  test('a claimed SO SAP IS shown as claimed', async function (assert) {
    this.ticketPackage = buildPackage(this.owner, [
      {
        id: '211829', person_id: 1, type: WAPSO, status: CLAIMED,
        name: 'Pat Partner', access_date: '2026-08-26 00:01:00', access_any_time: false,
      },
    ]);

    await render(hbs`<TicketOverview @ticketPackage={{this.ticketPackage}} @person={{this.person}} />`);

    assert.dom(this.element).includesText('SAPs For Significant Other Claimed');
    assert.dom(this.element).includesText('Pat Partner');
    assert.dom(this.element).doesNotIncludeText('No SAPs For Significant Others');
  });
});
