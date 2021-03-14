import Model, {attr} from '@ember-data/model'
import {ticketTypeLabel} from 'clubhouse/constants/ticket-types';
import moment from 'moment';

export const STAFF_CREDENTIAL = 'staff_credential';
export const RPT = 'reduced_price_ticket';
export const GIFT_TICKET = 'gift_ticket';
export const VEHICLE_PASS = 'vehicle_pass';
export const WAP = 'work_access_pass';
export const WAPSO = 'work_access_pass_so';

export const ALL_YOU_CAN_EAT = 'all_you_can_eat';
export const WET_SPOT = 'wet_spot';
export const WET_SPOT_POG = 'wet_spot_pog'; // unused currently
export const EVENT_RADIO = 'event_radio';

export const QUALIFIED = 'qualified';
export const CLAIMED = 'claimed';
export const BANKED = 'banked';
export const USED = 'used';
export const CANCELLED = 'cancelled';
export const EXPIRED = 'expired';
export const SUBMITTED = 'submitted';

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
  @attr('number') item_count;
  @attr('string', {readOnly: true}) create_date;
  @attr('string', {readOnly: true}) modified_date;

  // Only returned when requesting items available for delivery
  @attr('boolean', {readOnly: true}) has_staff_credential;

  get isTicket() {
    return (this.type === STAFF_CREDENTIAL
      || this.type === RPT
      || this.type === GIFT_TICKET);
  }

  get isStaffCredential() {
    return this.type === STAFF_CREDENTIAL;
  }

  get isReducedPriceTicket() {
    return this.type === RPT;
  }

  get isGiftTicket() {
    return this.type === GIFT_TICKET;
  }

  get isWAP() {
    return this.type === WAP;
  }

  get isWAPSO() {
    return this.type === WAPSO;
  }

  get isVehiclePass() {
    return this.type === VEHICLE_PASS;
  }

  get isEventRadio() {
    return this.type === EVENT_RADIO;
  }

  get isAllYouCanEat() {
    return this.type === ALL_YOU_CAN_EAT;
  }

  get isAppreciation() {
    const {type} = this;

    return (type === ALL_YOU_CAN_EAT || type === EVENT_RADIO || type === WET_SPOT);
  }

  get hasAccessDate() {
    return (this.isStaffCredential || this.isWAP || this.isWAPSO);
  }

  get isQualified() {
    return this.status === QUALIFIED;
  }

  get isClaimed() {
    return this.status === CLAIMED;
  }

  get isBanked() {
    return this.status === BANKED;
  }

  get isSubmitted() {
    return this.status === SUBMITTED;
  }

  get isUsed() {
    return this.status === USED;
  }

  get isCancelled() {
    return this.status === CANCELLED;
  }

  get isExpired() {
    return this.status === EXPIRED;
  }

  get isUsing() {
    return this.isClaimed || this.isSubmitted;
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
