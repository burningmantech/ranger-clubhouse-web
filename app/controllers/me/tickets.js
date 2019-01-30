import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { filterBy } from '@ember-decorators/object/computed';

import moment from 'moment';

// Format example: Saturday August 15th, 2018
const DATE_FORMAT = 'dddd MMMM Do, YYYY';

export default class MeTicketsController extends Controller {
  accessDocuments = [];
  wapsSONames = [];
  ticketDelivery = null;
  ticketingInfo = {};

  // Return a list of WAP SO names created from
  // the 'raw' API call
  @computed('wapSONames')
  get wapSOList() {
    const info = this.ticketingInfo;
    const list = this.wapSONames.map((row) => {
      return {
        id: row.id,
        name: row.name,
        access_date: moment(row.access_date).format(DATE_FORMAT)
      }
    });

    // Pad out to the max
    const max = info.wap_so_max;
    const access_date = moment(info.so_wap_default_date).format(DATE_FORMAT);

    while (list.length < max) {
      list.pushObject({id: 'new', name: '', access_date});
    }

    return list;
  }

  // Find all event tickets
  @filterBy('accessDocuments', 'isTicket', true) ticketList;

  // Find the first event ticket
  @computed('ticketList')
  get ticket() {
    return this.ticketList ? this.ticketList.firstObject : null;
  }

  // Find the WAP ticket
  @computed('accessDocuments')
  get wapTicket() {
    return this.accessDocuments.findBy('type', 'work_access_pass');
  }

  // Find the vehicle pass
  @computed('accessDocuments')
  get vehiclePassTicket() {
    return this.accessDocuments.findBy('type', 'vehicle_pass');
  }

  // Date by which the user has to make a choice
  @computed
  get submitDate() {
    // Return as Saturday September 10th, 2018
    return moment(this.ticketingInfo.submit_date).format(DATE_FORMAT);
  }

  // Time of day which the user has to make a choice
  @computed
  get submitTime() {
    // Return as 24 hour - hour:minute
    return moment(this.ticketingInfo.submit_date).format('HH:mm');
  }

  // Which ticket types are open to choose.
  @computed('ticketingInfo')
  get isAccepting() {
    const info = this.ticketingInfo;
    return (info.ticketing_status == 'accept'
    || info.vp_status == 'accept'
    || info.wap_status == 'accept'
    || info.wap_so_status == 'accept');
  }

  @computed('ticketingInfo')
  get ticketingStatus() {
    return this.ticketingInfo.ticketing_status;
  }

  // Save the choice for a ticket type
  @action
  saveChoiceAction(ticket, status) {
    if (status == '') {
      this.modal.info('No Selection', 'Please make your selection.');
      return;
    }
    ticket.updateStatus({status}).then(() => {
      ticket.set('status', status);
      this.toast.success('Your choice has been recorded. Thank you.');
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    });
  }

  // Update the SO WAP list - this is special cased since
  // multiple tickets are involved, *and* WAP SO tickets may be
  // created on the fly.

  @action
  saveSONamesAction() {
    const names = [];

    // Grab the name for a new record, or any name value (blank or not)
    // for an existing ticket
    this.wapSOList.forEach((row) => {
      if ((row.id == 'new' && row.name != '') || row.id != 'new') {
        names.push({id: row.id, name: row.name});
      }
    });

    this.ajax.request('access-document/sowap', {
      method: 'PATCH',
      data: {
        names,
        person_id: this.session.user.id
      }
    }).then((result) => {
      // Update the list
      this.set('wapSONames', result.names);
      this.toast.success('Your SO WAP list has been sucessfully updated. Thank you.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  saveDeliveryAction(model, isValid) {
    // Will call has no other validations, ignore any errors.
    if (model.get('method') != 'will_call' && !isValid) {
      return;
    }

    if (!isValid) {
      return;
    }
    return this.house.saveModel(model, 'The delivery information has been saved.');
  }
}
