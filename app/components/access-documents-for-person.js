import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import moment from 'moment';

/*
 * Build a row showing the person's current documents.
 */

@tagName('tr')
export default class AccessDocumentsForPersonComponent extends Component {
  @argument('object') person;
  @argument('object') documents;

  ticketInfoTypes = {
    staff_credential: 'CRED',
    reduced_price_ticket: 'RPT',
    gift_ticket: 'GIFT'
  };

  wapInfoTypes = {
    staff_credential: 'SC',
    work_access_pass: 'WAP'
  };

  vpTicketInfo = {
    vehicle_pass: 'VP'
  };

  wapSOsInfo = {
    work_access_pass_so: 'WAPSO'
  };

  @computed('documents')
  get record() {
    const notes = [];

    const record = {
      tickets: this._accessDocumentInfo('tickets', this.ticketInfoTypes, notes),
      arrivalDate: this._accessDocumentInfo('WAPs', this.wapInfoTypes, notes),
      vpTickets: this._accessDocumentInfo('VPs', this.vpTicketInfo, notes),
      significantOtherCount: this._accessDocumentInfo('WAPSOs', this.wapSOsInfo, notes),
    };

    record.notes = notes;

    return record;
  }

  _accessDocumentInfo(type, typeMap, notes) {
    const documents = this.documents.filter((doc) => typeMap[doc.type] ? 1 : 0);

    if (documents.length == 0) {
      return { style: '', text: '' };
    }

    const theOne = documents[0];

    let text = '';

    switch (type) {
    case 'WAPs':
      if (theOne.access_any_time) {
        text = 'any';
      } else {
        const accessDate = theOne.access_date;
        if (accessDate == '') {
          text = 'Unspecified';
        } else if (accessDate != 'any') {
          text = moment(theOne.access_date).format('ddd MM/DD/YY');
        } else {
          text = accessDate;
        }
      }
      break;

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

  @computed
  get documentsErrors() {
    const errors = [ ];

    this.documents.forEach((doc) => {
      if (doc.has_error) {
        errors.push(`RAD-${doc.id} - ${doc.error}`);
      }
    });

    return errors;
  }
}
