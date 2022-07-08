import Model, {attr} from '@ember-data/model';
import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';

export const STAFF_CREDENTIAL = 'staff_credential';
export const RPT = 'reduced_price_ticket';
export const GIFT_TICKET = 'gift_ticket';
export const VEHICLE_PASS = 'vehicle_pass';
export const WAP = 'work_access_pass';
export const WAPSO = 'work_access_pass_so';

export const ALL_EAT_PASS = 'all_eat_pass';
export const EVENT_EAT_PASS = 'event_eat_pass';
export const PRE_EVENT_EAT_PASS = 'pre_event_eat_pass';
export const POST_EVENT_EAT_PASS = 'post_event_eat_pass';
export const PRE_EVENT_EVENT_EAT_PASS  = 'pre_event_event_eat_pass';
export const EVENT_POST_EAT_PASS = 'event_post_event_eat_pass';
export const PRE_POST_EAT_PASS = 'pre_post_eat_pass';

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

export const DELIVERY_POSTAL = 'postal';
export const DELIVERY_WILL_CALL = 'will_call';
export const DELIVERY_NONE = 'none';
export const DELIVERY_EMAIL = 'email';

export const TypeLabels = {
  [STAFF_CREDENTIAL]: 'Staff Credential',
  [RPT]: 'Reduced-Price Ticket',
  [GIFT_TICKET]: 'Gift Ticket',
  [WAP]: 'Work Access Pass',
  [WAPSO]: 'Work Access Pass (SO)',
  [VEHICLE_PASS]: 'Vehicle Pass',
  [EVENT_RADIO]: 'Event Radio',
  [ALL_EAT_PASS]: 'All Eat Meal Pass',
  [EVENT_EAT_PASS]: 'Event Week Meal Pass',
  [PRE_EVENT_EAT_PASS]: 'Pre-Event Eat Pass',
  [POST_EVENT_EAT_PASS]: 'Post-Event Eat Pass',
  [PRE_EVENT_EVENT_EAT_PASS]: 'Pre-Event + Event Eat Pass',
  [PRE_POST_EAT_PASS]: 'Pre+Post Eat Pass',
  [EVENT_POST_EAT_PASS]: 'Event+Post Eat Pass',

  [WET_SPOT]: 'Wet Spot Access (Org Showers)',
  [WET_SPOT_POG]: 'Wet Spot Pog (Org Showers)'
};

export const TypeShortLabels = {
  [STAFF_CREDENTIAL]: 'SC',
  [RPT]: 'RPT',
  [GIFT_TICKET]: 'GIFT',
  [VEHICLE_PASS]: 'VP',
  [WAP]: 'WAP',
  [WAPSO]: 'SOWAP',

  [ALL_EAT_PASS]: 'ALL-EAT',
  [EVENT_EAT_PASS]: 'EVENT-EAT',
  [PRE_EVENT_EAT_PASS]: 'PRE-EAT',
  [POST_EVENT_EAT_PASS]: 'POST-EAT',
  [PRE_EVENT_EVENT_EAT_PASS]: 'PRE+EVENT-EAT',
  [EVENT_POST_EAT_PASS]: 'EVENT+POST-EAT',

  [EVENT_RADIO]: 'RADIO',
  [WET_SPOT]: 'WETSPOT',
};

export const DeliveryMethodLabels = {
  [DELIVERY_EMAIL]: 'Email',
  [DELIVERY_POSTAL]: 'US Mail',
  [DELIVERY_WILL_CALL]: 'Will Call',
  [DELIVERY_NONE]: 'None'
};

const MealPasses = [
  ALL_EAT_PASS,
  EVENT_EAT_PASS,
  PRE_EVENT_EAT_PASS,
  POST_EVENT_EAT_PASS,
  PRE_EVENT_EVENT_EAT_PASS ,
  EVENT_POST_EAT_PASS,
  PRE_POST_EAT_PASS
];

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

  @attr('string', {defaultValue: DELIVERY_NONE}) delivery_method;

  @attr('string') street1;
  @attr('string') street2;
  @attr('string') city;
  @attr('string') state;
  @attr('string', {defaultValue: 'US'}) country;
  @attr('string') postal_code;

  @attr('boolean', { defaultValue: false }) is_allocated;

  // Is this earned provision (is_allocated=false) is superseded by an allocated provision (is_allocated=true)?
  @attr('boolean', { readOnly: true, defaultValue: false }) is_superseded;

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

  get isMealPass() {
    return MealPasses.includes(this.type);
  }

  get isProvision() {
    const {type} = this;

    return (this.isMealPass || type === EVENT_RADIO || type === WET_SPOT);
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

  get typeLabelWithCounts() {
    const label = this.typeLabel;
    if (this.type === EVENT_RADIO) {
      return `${label} count ${this.item_count}`;
    } else {
      return label;
    }
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
