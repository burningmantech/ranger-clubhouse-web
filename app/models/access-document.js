import Model, {attr} from '@ember-data/model'
import {ticketTypeLabel} from 'clubhouse/constants/ticket-types';
import moment from 'moment';

export default class AccessDocumentModel extends Model {
  @attr('number') person_id;
  @attr('string') type;
  @attr('string') status;
  @attr('number') source_year;
  @attr('string') access_date;
  @attr('boolean') access_any_time;
  @attr('string') name;
  @attr('string', {readOnly: true}) comments;
  // write-only, backend will append to comments
  @attr('string') additional_comments;
  @attr('string') expiry_date;
  @attr('string', {readOnly: true}) create_date;
  @attr('string', {readOnly: true}) modified_date;

  // Only returned when requesting items available for delivery
  @attr('boolean', {readOnly: true}) has_staff_credential;

  get isTicket() {
    return (this.type === 'staff_credential'
      || this.type === 'reduced_price_ticket'
      || this.type === 'gift_ticket');
  }

  get isStaffCredential() {
    return this.type === 'staff_credential';
  }

  get isReducedPriceTicket() {
    return this.type === 'reduced_price_ticket';
  }

  get isGiftTicket() {
    return this.type === 'gift_ticket';
  }

  get hasAccessDate() {
    return (this.type === 'staff_credential' || this.type === 'work_access_pass' || this.type === 'work_access_pass_so');
  }

  get isQualified() {
    return this.status === 'qualified';
  }

  get isClaimed() {
    return this.status === 'claimed';
  }

  get isBanked() {
    return this.status === 'banked';
  }

  get isSubmitted() {
    return this.status === 'submitted';
  }

  get isUsed() {
    return this.status === 'used';
  }

  get isCancelled() {
    return this.status === 'cancelled';
  }

  get isExpired() {
    return this.status === 'expired';
  }

  get typeHuman() {
    return ticketTypeLabel[this.type];
  }

  get expiryYear() {
    return moment(this.expiry_date).format('YYYY');
  }

  get accessDateFormatted() {
    return moment(this.access_date).format('dddd MMMM Do, YYYY');
  }

  get admission_date() {
    if (this.access_any_time) {
      return 'any';
    } else {
      if (this.access_date) {
        return moment(this.access_date).format('YYYY-MM-DD');
      } else {
        return null;
      }
    }
  }

  set admission_date(value) {
    if (value === 'any') {
      this.access_any_time = true;
      this.access_date = null;
    } else {
      this.access_any_time = false;
      this.access_date = value;
    }
  }

  get expiry_year() {
    return moment(this.expiry_date).format('YYYY');
  }

  set expiry_year(year) {
    this.expiry_date = `${year}-09-15`;
  }
}
