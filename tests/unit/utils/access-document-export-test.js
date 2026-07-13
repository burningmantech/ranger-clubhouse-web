import {
  trsColumnAndDate,
  deliveryTypeForDocument,
  combinedDeliveryType,
  exportColumns,
  STAFF_CREDENTIAL_VP,
  SPT_VP,
} from 'clubhouse/utils/access-document-export';
import {
  DELIVERY_POSTAL,
  DELIVERY_PRIORITY,
  GIFT_TICKET,
  LSD_TICKET,
  SPT,
  STAFF_CREDENTIAL,
  VEHICLE_PASS_GIFT,
  WAP,
} from 'clubhouse/models/access-document';
import {module, test} from 'qunit';

module('Unit | Utility | access-document-export', function () {
  module('trsColumnAndDate', function () {
    test('SC/SAP types carry an access-date suffix', function (assert) {
      assert.deepEqual(trsColumnAndDate({type: WAP, access_any_time: true}),
        {trsColumn: 'sap_anytime', dateInfo: 'Anytime'}, 'anytime');

      assert.deepEqual(trsColumnAndDate({type: STAFF_CREDENTIAL, access_date: null}),
        {trsColumn: 'sc_unspecified', dateInfo: ' UNSPECIFIED ACCESS DATE'}, 'unspecified date');

      const dated = trsColumnAndDate({type: WAP, access_date: '2026-08-25'});
      assert.strictEqual(dated.trsColumn, 'sap_0825', 'dated SAP column is MMDD-suffixed');
      assert.ok(dated.dateInfo.includes('08/25'), 'date info carries the date');
    });

    test('other types map straight through with no date info', function (assert) {
      assert.deepEqual(trsColumnAndDate({type: SPT}), {trsColumn: 'spt', dateInfo: ''});
    });
  });

  module('deliveryTypeForDocument', function () {
    test('paid tickets follow the postal method', function (assert) {
      assert.strictEqual(deliveryTypeForDocument({type: SPT, delivery_method: DELIVERY_POSTAL}), 'Standard Mail');
      assert.strictEqual(deliveryTypeForDocument({type: SPT, delivery_method: DELIVERY_PRIORITY}), 'USPS Priority');
      assert.strictEqual(deliveryTypeForDocument({type: SPT, delivery_method: 'will-call'}), 'Will Call', 'non-postal → Will Call');
    });

    test('gift VP is credential pickup only when paired with a SC', function (assert) {
      assert.strictEqual(deliveryTypeForDocument({type: VEHICLE_PASS_GIFT, has_staff_credential: true}), 'Credential Pick Up');
      assert.strictEqual(deliveryTypeForDocument({type: VEHICLE_PASS_GIFT, delivery_method: DELIVERY_POSTAL}), 'USPS (Standard Mail)');
    });

    test('SC is pickup, SAP is print-at-home', function (assert) {
      assert.strictEqual(deliveryTypeForDocument({type: STAFF_CREDENTIAL}), 'Credential Pick Up');
      assert.strictEqual(deliveryTypeForDocument({type: WAP}), 'Print At Home');
    });
  });

  module('combinedDeliveryType', function () {
    test('SC pairs are credential pickup; others follow the ticket method', function (assert) {
      assert.strictEqual(combinedDeliveryType(STAFF_CREDENTIAL_VP, [{delivery_method: DELIVERY_POSTAL}]), 'Credential Pick Up');
      assert.strictEqual(combinedDeliveryType(SPT_VP, [{delivery_method: DELIVERY_POSTAL}]), 'Standard Mail');
      assert.strictEqual(combinedDeliveryType(SPT_VP, [{delivery_method: DELIVERY_PRIORITY}]), 'USPS Priority');
      assert.strictEqual(combinedDeliveryType(SPT_VP, [{delivery_method: 'box-office'}]), 'Will Call');
    });
  });

  module('exportColumns', function () {
    test('picks the format by filter and shapes {title, key}', function (assert) {
      const spt = exportColumns(SPT);
      assert.deepEqual(spt[0], {title: 'First Name', key: 'first_name'}, 'columns are {title, key}');
      assert.ok(spt.some((c) => c.key === 'spt_xfer'), 'SPT uses the paid/gift format');
      assert.ok(exportColumns(LSD_TICKET).some((c) => c.key === 'lsd'), 'LSD uses the LSD format');
      assert.ok(exportColumns(GIFT_TICKET).some((c) => c.key === 'spt_xfer'), 'gift ticket uses paid/gift format');
      assert.ok(exportColumns(WAP).some((c) => c.key === 'sap_anytime'), 'unmatched filters fall back to the unpaid format');
    });
  });
});
