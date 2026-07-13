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

module('Integration | Component | ticket-summary', function (hooks) {
  setupRenderingTest(hooks);

  test('SO SAP claimed count excludes qualified documents', async function (assert) {
    // One claimed + one qualified SO SAP -> should count as 1, not 2.
    this.ticketPackage = buildPackage(this.owner, [
      {id: '1', person_id: 1, type: WAPSO, status: CLAIMED, name: 'Pat Partner', access_any_time: true},
      {id: '2', person_id: 1, type: WAPSO, status: QUALIFIED, name: 'Sam Spouse', access_any_time: true},
    ]);

    await render(hbs`<TicketSummary @ticketPackage={{this.ticketPackage}} />`);

    assert.dom(this.element).includesText('1 Setup Access Pass for Significant Others');
    assert.dom(this.element).doesNotIncludeText('2 Setup Access Pass');
  });

  test('a qualified-only SO SAP is reported as unclaimed', async function (assert) {
    this.ticketPackage = buildPackage(this.owner, [
      {id: '1', person_id: 1, type: WAPSO, status: QUALIFIED, name: 'Pat Partner', access_any_time: true},
    ]);

    await render(hbs`<TicketSummary @ticketPackage={{this.ticketPackage}} />`);

    assert.dom(this.element).includesText('No Setup Access Passes for Significant Others');
  });
});
