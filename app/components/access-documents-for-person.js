import Component from '@glimmer/component';
import dayjs from 'dayjs';
import {isEmpty} from '@ember/utils';
import {
  STAFF_CREDENTIAL,
  WAP,
  BANKED,
  CLAIMED,
  SUBMITTED,
  QUALIFIED,
  TypeShortLabels,
  RPT, GIFT_TICKET, LSD_TICKET, VEHICLE_PASS, WAPSO, VEHICLE_PASS_GIFT, VEHICLE_PASS_LSD
} from 'clubhouse/models/access-document';

/*
 * Build a row showing the person's current documents.
 */

export default class AccessDocumentsForPersonComponent extends Component {
  constructor() {
    super(...arguments);
    const notes = [];
    const {documents} = this.args;

    this.tickets = this._accessDocumentInfo('tickets', [STAFF_CREDENTIAL, RPT], notes);
    this.giftTickets = documents.filter((d) => d.type === GIFT_TICKET);
    this.lsdTickets = documents.filter((d) => d.type === LSD_TICKET);
    this.giftVPs = documents.filter((d) => d.type === VEHICLE_PASS_GIFT);
    this.lsdVPs = documents.filter((d) => d.type ===  VEHICLE_PASS_LSD);

    this._findArrivalDate(notes);
    this.vpTickets = this._accessDocumentInfo('VPs', [ VEHICLE_PASS ], notes);
    this.significantOtherCount = this._accessDocumentInfo('WAPSOs', [ WAPSO], notes);
    this.notes = notes;

    const errors = [];

    this.args.documents.forEach((doc) => {
      if (doc.has_error) {
        errors.push(`RAD-${doc.id} - ${doc.error}`);
      }
    });

    this.documentsErrors = errors;
  }

  _buildAccessDate(doc) {
    if (doc.access_any_time) {
      return 'any';
    } else if (!doc.access_date) {
      return 'missing';
    } else if (doc.access_date === 'any') {
      return 'any';
    } else {
      return dayjs(doc.access_date).format('ddd MM/DD/YY');
    }
  }

  _findArrivalDate(notes) {
    const docs = this.args.documents;
    const waps = docs.filter((doc) => (doc.type === WAP));

    if (waps.length > 1) {
      notes.push(`${waps.length} WAPs`);
    }

    // Find a claimed SC
    let doc = docs.find((doc) => (doc.type === STAFF_CREDENTIAL && doc.status === CLAIMED));

    // Nope, try find a WAP.
    if (!doc) {
      doc = docs.find((doc) => doc.type === WAP);
    }

    // Try again -- ANY SCs.
    if (!doc) {
      doc = docs.find((doc) => doc.type === STAFF_CREDENTIAL);
    }

    let style = '', text;
    if (!doc) {
      text = 'missing';
    } else {
      // Alert to someone having a staff credential AND WAP.
      if (doc.type === STAFF_CREDENTIAL && waps.length > 0) {
        notes.push('SC+WAP');
      }

      if (doc.status === CLAIMED || doc.status === BANKED || doc.status === SUBMITTED) {
        style = `access-document-${doc.status}`;
      }

      text = this._buildAccessDate(doc);
    }

    this.arrivalDate = {style, text};
  }

  _accessDocumentInfo(type, typeMap, notes) {
    const documents = this.args.documents.filter((doc) => typeMap.includes(doc.type));

    if (!documents.length) {
      return {style: '', text: ''};
    }

    const theOne = documents[0];

    let text = '';
    switch (type) {
      case 'WAPSOs':
        text = documents.length;
        break;

      default:
        text = TypeShortLabels[theOne.type] ?? theOne.type;
        break;
    }

    let weird = '';
    const threshold = type === 'WAPSOs' ? 3 : 1;

    if (documents.length > threshold) {
      weird = `${documents.length} ${type}`;
    }

    if (type === 'tickets') {
      const expired = [];
      documents.forEach((doc) => {
        if (doc.past_expire_date && (doc.status === BANKED || doc.status === QUALIFIED)) {
          expired.push(`${typeMap[doc.type]} EXPIRED`);
        }
      });
      if (expired.length > 0) {
        if (!isEmpty(weird)) {
          weird += '; ';
        }
        weird += expired.join(' ');
      }
    }

    if (!isEmpty(weird)) {
      notes.push(weird);
    }

    let style = '';
    if (theOne.status === CLAIMED || theOne.status === BANKED || theOne.status === SUBMITTED) {
      style = `access-document-${theOne.status}`;
    }

    return {style, text};
  }
}
