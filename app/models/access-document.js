import Model, {attr} from '@ember-data/model';
import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';

export const GIFT_TICKET = 'gift_ticket';
export const LSD_TICKET = 'lsd_ticket';
export const SPT = 'special_price_ticket';
export const STAFF_CREDENTIAL = 'staff_credential';
export const VEHICLE_PASS = 'vehicle_pass';
export const VEHICLE_PASS_GIFT = 'vehicle_pass_gift';
export const VEHICLE_PASS_LSD = 'vehicle_pass_lsd';
export const WAP = 'work_access_pass';
export const WAPSO = 'work_access_pass_so';

export const BANKED = 'banked';
export const CANCELLED = 'cancelled';
export const CLAIMED = 'claimed';
export const EXPIRED = 'expired';
export const QUALIFIED = 'qualified';
export const SUBMITTED = 'submitted';
export const TURNED_DOWN = 'turned_down';
export const USED = 'used';

export const DELIVERY_POSTAL = 'postal';
export const DELIVERY_WILL_CALL = 'will_call';
export const DELIVERY_NONE = 'none';
export const DELIVERY_EMAIL = 'email';

export const DELIVERY_SC = 'staff_credentialing'; // Only used for exports, not a real type.

export const TypeLabels = {
  [GIFT_TICKET]: 'Gift Ticket',
  [LSD_TICKET]: 'LSD Ticket',
  [SPT]: 'Special Price Ticket',
  [STAFF_CREDENTIAL]: 'Staff Credential',
  [VEHICLE_PASS]: 'Vehicle Pass',
  [VEHICLE_PASS_GIFT]: 'Gift Vehicle Pass',
  [VEHICLE_PASS_LSD]: 'LSD Vehicle Pass',
  [WAPSO]: 'S.O. Work Access Pass',
  [WAP]: 'Work Access Pass',
};

export const TypeShortLabels = {
  [STAFF_CREDENTIAL]: 'CRED',
  [SPT]: 'SPT',
  [GIFT_TICKET]: 'GIFT',
  [LSD_TICKET]: 'LSD',
  [VEHICLE_PASS]: 'VP',
  [VEHICLE_PASS_GIFT]: 'GIFTVP',
  [VEHICLE_PASS_LSD]: 'LSDVP',
  [WAP]: 'WAP',
  [WAPSO]: 'SOWAP',
};

export const DeliveryMethodLabels = {
  [DELIVERY_EMAIL]: 'Email',
  [DELIVERY_POSTAL]: 'US Mail',
  [DELIVERY_WILL_CALL]: 'Will Call',
  [DELIVERY_NONE]: 'None',
  [DELIVERY_SC]: 'Staff Credentialing',  // Only used for export advisory, not a real delivery type.
};

export const StatusLabels = {
  [BANKED]: 'banked',
  [CANCELLED]: 'cancelled',
  [CLAIMED]: 'claimed',
  [EXPIRED]: 'expired',
  [QUALIFIED]: 'qualified',
  [SUBMITTED]: 'submitted',
  [TURNED_DOWN]: 'turned down',
  [USED]: 'used',
};

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
  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;

  // Only returned when requesting items available for delivery
  @attr('boolean', {readOnly: true}) has_staff_credential;

  @attr('string', {defaultValue: DELIVERY_NONE}) delivery_method;

  @attr('string') street1;
  @attr('string') street2;
  @attr('string') city;
  @attr('string') state;
  @attr('string', {defaultValue: 'US'}) country;
  @attr('string') postal_code;

  @attr('', { readOnly: true }) person;

  get isRegularTicket() {
    return (this.type === STAFF_CREDENTIAL || this.type === SPT);
  }

  get isSpecialTicket() {
    return (this.type === LSD_TICKET || this.type === GIFT_TICKET);
  }

  get isStaffCredential() {
    return this.type === STAFF_CREDENTIAL;
  }

  get isSpecialPriceTicket() {
    return this.type === SPT;
  }

  get isGiftTicket() {
    return this.type === GIFT_TICKET;
  }

  get isLSDTicket() {
    return this.type === LSD_TICKET;
  }

  /**
   * Is this a WAP?
   *
   * @returns {boolean}
   */

  get isWAP() {
    return this.type === WAP;
  }

  /**
   * Is this a S.O. WAP?
   *
   * @returns {boolean}
   */

  get isWAPSO() {
    return this.type === WAPSO;
  }

  get isVehiclePass() {
    return this.type === VEHICLE_PASS;
  }

  get isVehiclePassGift() {
    return this.type === VEHICLE_PASS_GIFT;
  }
  get isVehiclePassLSD() {
    return this.type === VEHICLE_PASS_LSD;
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

  get isTurnedDown() {
    return this.status === TURNED_DOWN;
  }

  get isUsing() {
    return this.isClaimed || this.isSubmitted;
  }

  get isDeliveryEmail() {
    return this.delivery_method === DELIVERY_EMAIL;
  }

  get isDeliveryPostal() {
    return this.delivery_method === DELIVERY_POSTAL;
  }

  get isDeliveryWillCall() {
    return this.delivery_method === DELIVERY_WILL_CALL;
  }

  get isDeliveryNone() {
    return this.delivery_method === DELIVERY_NONE || isEmpty(this.delivery_method);
  }

  get haveAddress() {
    if (this.delivery_method === DELIVERY_WILL_CALL) {
      return true;
    }

    if (this.delivery_method === DELIVERY_NONE || isEmpty(this.delivery_method)) {
      return false;
    }

    for (const name of ['street1', 'city', 'state', 'postal_code']) {
      if (isEmpty(this[name])) {
        return false
      }
    }

    return true;
  }


  get typeLabel() {
    return TypeLabels[this.type] ?? this.type;
  }

  get shortTypeLabel() {
    return TypeShortLabels[this.type] ?? this.type;
  }

  get deliveryMethodLabel() {
    return DeliveryMethodLabels[this.delivery_method] ?? this.delivery_method;
  }

  get expiryYear() {
    return dayjs(this.expiry_date).format('YYYY');
  }

  get accessDateFormatted() {
    return dayjs(this.access_date).format('dddd MMMM Do, YYYY');
  }

  get admission_date() {
    if (this.access_any_time) {
      return 'any';
    } else if (this.access_date) {
      return dayjs(this.access_date).format('YYYY-MM-DD');
    } else {
      return null;
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
    return dayjs(this.expiry_date).format('YYYY');
  }

  set expiry_year(year) {
    this.expiry_date = `${year}-09-15`;
  }
}
