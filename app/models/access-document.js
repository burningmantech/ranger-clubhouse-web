import DS from 'ember-data';
import { computed } from '@ember-decorators/object';
import { attr } from '@ember-decorators/data';

import moment from 'moment';
import { memberAction } from 'ember-api-actions';

const typeHuman = {
  staff_credential:     'Staff Credential',
  reduced_price_ticket: 'Reduced-Price Ticket',
  gift_ticket:          'Gift Ticket',
  work_access_pass:     'Work Access Pass',
  work_access_pass_so:  'Work Access Pass (SO)',
  vehicle_pass:         'Vehicle Pass',
};

export default class AccessDocumentModel extends DS.Model {
  @attr('number') person_id;
  @attr('string') type;
  @attr('string') status;
  @attr('number') source_year;
  @attr('string') access_date;
  @attr('boolean') access_any_time;
  @attr('string') name;
  @attr('string') comments;
  @attr('string') expiry_date;
  @attr('string') create_date;
  @attr('string') modified_date;

  // Update the status
  updateStatus = memberAction({ path: 'status', type: 'patch'});

  @computed('type')
  get isTicket() {
      return (this.type == 'staff_credential'
        || this.type == 'reduced_price_ticket'
        || this.type == 'gift_ticket');
  }

  @computed('type')
  get isStaffCredential() {
    return this.type == 'staff_credential';
  }

  @computed('type')
  get isReducedPriceTicket() {
    return this.type == 'reduced_price_ticket';
  }

  @computed('type')
  get isGiftTicket() {
    return this.type == 'gift_ticket';
  }

  @computed('status')
	get isQualified() {
    return this.status == 'qualified';
  }

  @computed('status')
	get isClaimed() {
    return this.status == 'claimed';
  }

  @computed('status')
	get isBanked() {
    return this.status == 'banked';
  }

  @computed('status')
	get isSubmitted() {
    return this.status == 'submitted';
  }

  @computed('status')
	get isUsed() {
    return this.status == 'used';
  }

  @computed('status')
	get isCancelled() {
    return this.status == 'cancelled';
  }

  @computed('status')
	get isExpired() {
    return this.status == 'expired';
  }

  @computed('type')
  get typeHuman() {
    return typeHuman[this.type];
  }

  @computed('expiry_date')
  get expiryYear() {
    return moment(this.expiry_date).format('YYYY');
  }

  @computed('access_date')
  get accessDateFormatted() {
    return moment(this.access_date).format('dddd MMMM Do, YYYY');
  }
}
