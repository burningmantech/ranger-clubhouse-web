import Component from '@glimmer/component';
import moment from 'moment';

/*
 * Build a row showing the person's current documents.
 */

export default class AccessDocumentsForPersonComponent extends Component {
  ticketInfoTypes = {
    staff_credential: 'CRED',
    reduced_price_ticket: 'RPT',
    gift_ticket: 'GIFT'
  };

  vpTicketInfo = {
    vehicle_pass: 'VP'
  };

  wapSOsInfo = {
    work_access_pass_so: 'WAPSO'
  };

  constructor() {
    super(...arguments);
    const notes = [];

    this.tickets = this._accessDocumentInfo('tickets', this.ticketInfoTypes, notes);
    this._findArrivalDate(notes);
    this.vpTickets = this._accessDocumentInfo('VPs', this.vpTicketInfo, notes);
    this.significantOtherCount = this._accessDocumentInfo('WAPSOs', this.wapSOsInfo, notes);
    this.notes = notes;
  }

  _buildAccessDate(doc) {
    if (doc.access_any_time) {
      return 'any';
    } else if (!doc.access_date) {
      return 'missing';
    } else if (doc.access_date == 'any') {
      return 'any';
    } else {
      return moment(doc.access_date).format('ddd MM/DD/YY');
    }
  }

  _findArrivalDate(notes) {
    const docs = this.args.documents;
    const waps = docs.filter((doc) => (doc.type == 'work_access_pass'));

    if (waps.length > 1) {
      notes.push(`${waps.length} WAPs`);
    }

    // Find a claimed SC
    let doc = docs.find((doc) => (doc.type == 'staff_credential' && doc.status == 'claimed'));

    // Nope, try find a WAP.
    if (!doc) {
        doc = docs.find((doc) => doc.type == 'work_access_pass');
    }

    // Try again -- ANY SCs.
    if (!doc) {
        doc = docs.find((doc) => doc.type == 'staff_credential');
    }

    let style = '', text = '';
    if (!doc) {
        text = 'missing';
    } else {
      // Alert to someone having a staff credential AND WAP.
      if (doc.type == 'staff_credential' && waps.length > 0) {
        notes.push('SC+WAP');
      }

      if (doc.status == 'claimed' || doc.status == 'banked' || doc.status == 'submitted') {
        style = `access-document-${doc.status}`;
      }

      text = this._buildAccessDate(doc);
    }

    this.arrivalDate =  { style, text };
  }

  _accessDocumentInfo(type, typeMap, notes) {
    const documents = this.args.documents.filter((doc) => typeMap[doc.type] ? 1 : 0);

    if (documents.length == 0) {
      return { style: '', text: '' };
    }

    const theOne = documents[0];

    let text = '';
    switch (type) {
    case 'WAPSOs':
      text = +documents.length;
      break;

    default:
      text = typeMap[theOne.type];
      break;
    }

    let weird = '';
    const threshold = type == 'WAPSOs' ? 3 : 1;

    if (documents.length > threshold) {
      weird = `${documents.length} ${type}`;
    }

    if (type == 'tickets') {
      const expired = [];
      documents.forEach((doc) => {
        if (doc.past_expire_date && (doc.status == 'banked' || doc.status == 'qualified')) {
          expired.push(`${typeMap[doc.type]} EXPIRED`);
        }
      });
      if (expired.length > 0) {
        if (weird != '') {
          weird += '; ';
        }
        weird += expired.join(' ');
      }
    }

    if (weird != '') {
      notes.push(weird);
    }

    let style = '';
    if (theOne.status == 'claimed' || theOne.status == 'banked' || theOne.status == 'submitted') {
      style = `access-document-${theOne.status}`;
    }

    return { style, text };
  }

  get documentsErrors() {
    const errors = [ ];

    this.args.documents.forEach((doc) => {
      if (doc.has_error) {
        errors.push(`RAD-${doc.id} - ${doc.error}`);
      }
    });

    return errors;
  }
}
