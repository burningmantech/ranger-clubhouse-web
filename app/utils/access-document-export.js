import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';
import {
  DELIVERY_POSTAL,
  DELIVERY_PRIORITY,
  GIFT_TICKET,
  LSD_TICKET,
  SPT,
  STAFF_CREDENTIAL,
  VEHICLE_PASS_SP,
  VEHICLE_PASS_GIFT,
  VEHICLE_PASS_LSD,
  WAP,
  WAPSO, DELIVERY_WILL_CALL,
} from 'clubhouse/models/access-document';

/**
 * Access Document (TRS) export rules: TRS column mapping, delivery-type rules,
 * and CSV format selection. Render-free and Ember-free so the gnarly,
 * historically bug-prone export logic can be unit-tested with plain doc objects
 * (see tests/unit/utils/access-document-export-test). The trs controller owns
 * filtering, selection, and the ajax/download/analytics side effects.
 */

// Composite "must have both ticket + VP" filter keys. Shared with the controller
// (which also filters on them), so they live here as the single source.
export const STAFF_CREDENTIAL_VP = 'staff_credential_vp';
export const SPT_VP = 'spt_vp';
export const GIFT_TICKET_VP = 'gift_ticket_vp';
export const LSD_TICKET_VP = 'lsd_vp';

// Delivery-type strings as TRS expects them.
const CREDENTIAL_PICKUP = 'Credential Pick Up'; // Pick up in Gerlach before Box Office is running
const WILL_CALL = 'Will Call';  // Box office
const USPS_STANDARD = 'Standard Mail'; // For paid items
const USPS_PRIORITY = 'USPS Priority'; // For paid items
const USPS_STANDARD_FOR_GIFT = 'USPS (Standard Mail)';
export const UPS = 'UPS';
const PRINT_AT_HOME = 'Print At Home';

const TRS_COLUMN = {
  [STAFF_CREDENTIAL]: 'sc',
  [SPT]: 'spt',
  [GIFT_TICKET]: 'gift_ticket',
  [LSD_TICKET]: 'lsd',
  [VEHICLE_PASS_SP]: 'sp_vp',
  [VEHICLE_PASS_GIFT]: 'gift_vp',
  [VEHICLE_PASS_LSD]: 'lsd_vp',
  [WAP]: 'sap',
  [WAPSO]: 'sap'
};

const PAID_AND_GIFT_TICKET_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method Of Delivery:', 'delivery_type'],
  ['Question: Nickname/Project:', 'project_name'],
  ['Question: Notes:', 'note'],
  ['Request: $250 Ticket', 'spt'],
  ['Request: $165 Vehicle Pass', 'paid_vp'],
  ['Request: Gift Ticket', 'not_used_gift_ticket'], // We use the transfferrable gift ticket
  ['Request: Gift Vehicle Pass', 'gift_vp'],
  ['Request: Transferrable $250 Ticket', 'spt_xfer'],
  ['Request: Transferrable $165 Vehicle Pass', 'vp_xfer'],
  ['Request: Transferrable Gift Ticket', 'gift_ticket'],
  ['Request: Transferrable Gift Vehicle Pass', 'vehicle_pass_gift'],
  // New for 2023, not used currently.
  ['Request: Transferrable $75 Vehicle Pass', 'discount_vp_xfer'],
  ['Request: $75 Vehicle Pass', 'sp_vp'],
];

// Yes, the dates are out of order and have been since 2022. Zero clues on why org ticketing does it this way.
const UNPAID_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method of Delivery:', 'delivery_type'],
  ['Question: Nickname/Project:', 'project_name'],   // callsign
  ['Question: Notes:', 'note'],
  //['Request: Gift Ticket', 'gift_ticket'],
  ['Request: Gift Vehicle Pass', 'gift_vp'],
  ['Request: Setup Access Pass 8/26 &amp; Later', 'sap_0826'],
  ['Request: Setup Access Pass 8/27 &amp; Later', 'sap_0827'],
  ['Request: Setup Access Pass 8/28 &amp; Later', 'sap_0828'],
  ['Request: Setup Access Pass 8/29 &amp; Later', 'sap_0829'],
  ['Request: Setup Access Pass 8/8 &amp; Later', 'sap_0808'],
  ['Request: Setup Access Pass 8/9 &amp; Later', 'sap_0809'],
  ['Request: Setup Access Pass 8/10 &amp; Later', 'sap_0810'],
  ['Request: Setup Access Pass 8/11 &amp; Later', 'sap_0811'],
  ['Request: Setup Access Pass 8/12 &amp; Later', 'sap_0812'],
  ['Request: Setup Access Pass 8/13 &amp; Later', 'sap_0813'],
  ['Request: Setup Access Pass 8/14 &amp; Later', 'sap_0814'],
  ['Request: Setup Access Pass  8/15 &amp; Later', 'sap_0815'],
  ['Request: Setup Access Pass 8/16 &amp; Later', 'sap_0816'],
  ['Request: Setup Access Pass 8/17 &amp; Later', 'sap_0817'],
  ['Request: Setup Access Pass 8/18 &amp; Later', 'sap_0818'],
  ['Request: Setup Access Pass 8/19 &amp; Later', 'sap_0819'],
  ['Request: Setup Access Pass 8/20 &amp; Later', 'sap_0820'],
  ['Request: Setup Access Pass 8/21 &amp; Later', 'sap_0821'],
  ['Request: Setup Access Pass 8/22 &amp; Later', 'sap_0822'],
  ['Request: Setup Access Pass 8/23 &amp; Later', 'sap_0823'],
  ['Request: Setup Access Pass 8/24 &amp; Later', 'sap_0824'],
  ['Request: Setup Access Pass 8/25 &amp; Later', 'sap_0825'],
  ['Request: Setup Access Pass - Anytime', 'sap_anytime'],
  ['Request: Staff Credential Pickup 8/14 &amp; After', 'sc_0814'],
  ['Request: Staff Credential Pickup 8/13 &amp; After', 'sc_0813'],
  ['Request: Staff Credential Pickup 8/26 &amp; After', 'sc_0826'],
  ['Request: Staff Credential Pickup 8/27 &amp; After', 'sc_0827'],
  ['Request: Staff Credential Pickup 8/28 &amp; After', 'sc_0828'],
  ['Request: Staff Credential Pickup 8/29 &amp; After', 'sc_0829'],
  ['Request: Staff Credential Pickup 8/8 &amp; After', 'sc_0808'],
  ['Request: Staff Credential Pickup 8/9 &amp; After', 'sc_0809'],
  ['Request: Staff Credential Pickup 8/10 &amp; After', 'sc_0810'],
  ['Request: Staff Credential Pickup 8/11 &amp; After', 'sc_0811'],
  ['Request: Staff Credential Pickup 8/12 &amp; After', 'sc_0812'],
  ['Request: Staff Credential Pickup 8/15 &amp; After', 'sc_0815'],
  ['Request: Staff Credential Pickup 8/16 &amp; After', 'sc_0816'],
  ['Request: Staff Credential Pickup 8/17 &amp; After', 'sc_0817'],
  ['Request: Staff Credential Pickup 8/18 &amp; After', 'sc_0818'],
  ['Request: Staff Credential Pickup 8/19 &amp; After', 'sc_0819'],
  ['Request: Staff Credential Pickup 8/20 &amp; After', 'sc_0820'],
  ['Request: Staff Credential Pickup 8/21 &amp; After', 'sc_0821'],
  ['Request: Staff Credential Pickup 8/22 &amp; After', 'sc_0822'],
  ['Request: Staff Credential Pickup 8/23 &amp; After', 'sc_0823'],
  ['Request: Staff Credential Pickup 8/24 &amp; After', 'sc_0824'],
  ['Request: Staff Credential Pickup Anytime', 'sc_anytime'],
  ['Request: Staff Credential Pickup 8/25 &amp; After', 'sc_0825'],
];

const LSD_EXPORT_FORMAT = [
  ['First Name', 'first_name'],
  ['Last Name', 'last_name'],
  ['Email', 'email'],
  ['Question: Method Of Delivery:', 'delivery_type'],
  ['Question: Nickname/Project:', 'project_name'],
  ['Question: Notes:', 'note'],
  // Shipping addresses are not used in 2022, however the headers are still present. sigh.
  // removed 'not_used_' prefix if later events requires address
  ['Shipping Address:: Country', 'not_used_country'],
  ['Shipping Address:: Full Name', 'not_used_full_name'],
  ['Shipping Address:: Address', 'not_used_address1'],
  ['Shipping Address:: Address Line 2', 'not_used_address2'],
  ['Shipping Address:: City', 'not_used_city'],
  ['Shipping Address:: State', 'not_used_state'],
  ['Shipping Address:: Zip', 'not_used_zip'],
  ['Shipping Address:: Phone', 'not_used_phone'],
  ['Request: $165 Vehicle Pass - Directed', 'lsd_vp'],
  ['Request: $550 Ticket - Directed', 'lsd'],
  // Not used.
  ['Request: $675 Ticket - Directed', 'ignore'],
  ['Request: $775 Ticket - Directed', 'ignore'],
  ['Request: $975 Ticket - Directed', 'ignore'],
  ['Request: $1500 Ticket - Directed', 'ignore'],
  ['Request: $3000 Ticket - Directed', 'ignore'],
  ['Request: Non-Transferrable $550 Ticket', 'ignore']
];

/**
 * The TRS column and human date-info string for a document. SC/SAP types carry
 * an access-date suffix; everything else maps straight through TRS_COLUMN.
 *
 * @param {Object} doc an access document
 * @returns {{trsColumn: string, dateInfo: string}}
 */

export function trsColumnAndDate(doc) {
  let trsColumn = '', dateInfo = '';

  switch (doc.type) {
    case STAFF_CREDENTIAL:
    case WAP:
    case WAPSO:
      if (doc.access_any_time) {
        dateInfo = 'Anytime';
        trsColumn = 'anytime';
      } else if (isEmpty(doc.access_date)) {
        dateInfo = ' UNSPECIFIED ACCESS DATE';
        trsColumn = 'unspecified';
      } else {
        dateInfo = dayjs(doc.access_date).format(' ddd MM/D');
        trsColumn = dayjs(doc.access_date).format('MMDD');
      }
      trsColumn = TRS_COLUMN[doc.type] + '_' + trsColumn;
       break;

    default:
      trsColumn = TRS_COLUMN[doc.type];
      break;
  }

  return {trsColumn, dateInfo};
}

/**
 * Delivery-type for a single document row, by type + delivery method.
 *
 * @param {Object} doc an access document
 * @returns {string|undefined}
 */

export function deliveryTypeForDocument(doc) {
  const isPostal = (doc.delivery_method === DELIVERY_POSTAL || doc.delivery_method === DELIVERY_PRIORITY);
  // Non-postal delivery (e.g. will_call) is box-office Will Call, matching combinedDeliveryType().
  let postalDeliveryType = WILL_CALL;
  if (isPostal) {
    postalDeliveryType = doc.delivery_method === DELIVERY_PRIORITY ? USPS_PRIORITY : USPS_STANDARD;
  }

  switch (doc.type) {
    case SPT:
    case LSD_TICKET:
    case VEHICLE_PASS_LSD:
      return postalDeliveryType;

    case VEHICLE_PASS_GIFT:
      // a Gift VP should always be paired with a SC but ya never know.
      return doc.has_staff_credential ? CREDENTIAL_PICKUP : (isPostal ? USPS_STANDARD_FOR_GIFT : UPS);

    case VEHICLE_PASS_SP:
      return postalDeliveryType;

    case STAFF_CREDENTIAL:
      return CREDENTIAL_PICKUP;

    case WAP:
    case WAPSO:
      return PRINT_AT_HOME;

    case GIFT_TICKET:
      if (doc.delivery_method === DELIVERY_POSTAL) {
        return USPS_STANDARD_FOR_GIFT
      } else if (doc.delivery_method === DELIVERY_PRIORITY) {
        return UPS;
      } else if (doc.delivery_method === DELIVERY_WILL_CALL) {
        return WILL_CALL;
      }
      break;
  }

  return undefined;
}

/**
 * Delivery-type for a combined ticket+VP row. SC pairs are credential pickup;
 * everything else follows the ticket's delivery method.
 *
 * @param {string} filter the active composite filter
 * @param {Object[]} documents the row's documents (ticket(s) first)
 * @returns {string}
 */

export function combinedDeliveryType(filter, documents) {
  if (filter === STAFF_CREDENTIAL_VP) {
    return CREDENTIAL_PICKUP;
  }

  const method = documents[0].delivery_method;
  if (method === DELIVERY_POSTAL) {
    return USPS_STANDARD;
  } else if (method === DELIVERY_PRIORITY) {
    return USPS_PRIORITY;
  }
  return WILL_CALL;
}

/**
 * The CSV columns ({title, key}) for the export, chosen by filter.
 *
 * @param {string} filter the active filter
 * @returns {{title: string, key: string}[]}
 */

export function exportColumns(filter) {
  let format;

  switch (filter) {
    case SPT:
    case SPT_VP:
    case VEHICLE_PASS_SP:
    case GIFT_TICKET:
      format = PAID_AND_GIFT_TICKET_EXPORT_FORMAT;
      break;

    case LSD_TICKET:
    case LSD_TICKET_VP:
    case VEHICLE_PASS_LSD:
      format = LSD_EXPORT_FORMAT;
      break;

    default:
      format = UNPAID_EXPORT_FORMAT;
      break;
  }

  return format.map((r) => ({title: r[0], key: r[1]}));
}
