import Model, {attr} from '@ember-data/model';
import dayjs from 'dayjs';

export const ALL_EAT_PASS = 'all_eat_pass';
export const EVENT_EAT_PASS = 'event_eat_pass';
export const PRE_EVENT_EAT_PASS = 'pre_event_eat_pass';
export const POST_EVENT_EAT_PASS = 'post_event_eat_pass';
export const PRE_EVENT_EVENT_EAT_PASS = 'pre_event_event_eat_pass';
export const EVENT_POST_EAT_PASS = 'event_post_event_eat_pass';
export const PRE_POST_EAT_PASS = 'pre_post_eat_pass';

export const EVENT_RADIO = 'event_radio';

export const WET_SPOT = 'wet_spot';

export const AVAILABLE = 'available';
export const CLAIMED = 'claimed';
export const BANKED = 'banked';
export const USED = 'used';
export const CANCELLED = 'cancelled';
export const EXPIRED = 'expired';
export const SUBMITTED = 'submitted';

export const TypeLabels = {
  [ALL_EAT_PASS]: 'All Eat Meal Pass',
  [EVENT_EAT_PASS]: 'Event Week Meal Pass',
  [PRE_EVENT_EAT_PASS]: 'Pre-Event Eat Pass',
  [POST_EVENT_EAT_PASS]: 'Post-Event Eat Pass',
  [PRE_EVENT_EVENT_EAT_PASS]: 'Pre-Event + Event Eat Pass',
  [PRE_POST_EAT_PASS]: 'Pre+Post Eat Pass',
  [EVENT_POST_EAT_PASS]: 'Event+Post Eat Pass',

  [EVENT_RADIO]: 'Event Radio',
  [WET_SPOT]: 'Wet Spot (Org Showers)'
};

export const TypeShortLabels = {
  [ALL_EAT_PASS]: 'ALL-EAT',
  [EVENT_EAT_PASS]: 'EVENT-EAT',
  [PRE_EVENT_EAT_PASS]: 'PRE-EAT',
  [POST_EVENT_EAT_PASS]: 'POST-EAT',
  [PRE_EVENT_EVENT_EAT_PASS]: 'PRE+EVENT-EAT',
  [EVENT_POST_EAT_PASS]: 'EVENT+POST-EAT',
};

export const MealMatrix = {
  [ALL_EAT_PASS]: 'pre+event+post',
  [EVENT_EAT_PASS]: 'event',
  [PRE_EVENT_EAT_PASS]: 'pre',
  [POST_EVENT_EAT_PASS]: 'post',
  [PRE_EVENT_EVENT_EAT_PASS]: 'pre+event',
  [EVENT_POST_EAT_PASS]: 'event+post',
  [PRE_POST_EAT_PASS]: 'pre+post'
};

const MealPasses = {
  [ALL_EAT_PASS]: true,
  [EVENT_EAT_PASS]: true,
  [PRE_EVENT_EAT_PASS]: true,
  [POST_EVENT_EAT_PASS]: true,
  [PRE_EVENT_EVENT_EAT_PASS]: true,
  [EVENT_POST_EAT_PASS]: true,
  [PRE_POST_EAT_PASS]: true
};

export default class ProvisionModel extends Model {
  @attr('number') person_id;
  @attr('string') type;
  @attr('string') status;
  @attr('number') source_year;
  @attr('string', {readOnly: true}) comments;
  // write-only, backend will append to comments
  @attr('string') additional_comments;
  @attr('string') expires_on;
  @attr('number') item_count;
  @attr('string', {readOnly: true}) created_at;
  @attr('string', {readOnly: true}) updated_at;

  @attr('boolean', {defaultValue: false}) is_allocated;

  get isEventRadio() {
    return this.type === EVENT_RADIO;
  }

  get isMealPass() {
    return MealPasses[this.type] ?? false;
  }

  get isWetSpot() {
    return this.type === WET_SPOT;
  }

  get isAvailable() {
    return this.status === AVAILABLE;
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

  get typeLabel() {
    return TypeLabels[this.type] ?? this.type;
  }

  get mealPeriods() {
    return MealMatrix[this.type];
  }

  get typeLabelWithCounts() {
    const label = this.typeLabel;
    if (this.type === EVENT_RADIO) {
      return `${label} count ${this.item_count}`;
    } else {
      return label;
    }
  }

  get expiryYear() {
    return dayjs(this.expires_on).format('YYYY');
  }

  get expiry_year() {
    return dayjs(this.expires_on).format('YYYY');
  }

  set expiry_year(year) {
    this.expires_on = `${year}-09-15`;
  }
}
