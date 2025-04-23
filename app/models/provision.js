import Model, {attr} from '@ember-data/model';
import dayjs from 'dayjs';
import {buildMealsLabel, MEALS_FULL_LABELS} from "clubhouse/models/bmid";


export const EVENT_RADIO = 'event_radio';
export const MEALS = 'meals';
export const WET_SPOT = 'wet_spot';

export const AVAILABLE = 'available';
export const CLAIMED = 'claimed';
export const BANKED = 'banked';
export const USED = 'used';
export const CANCELLED = 'cancelled';
export const EXPIRED = 'expired';
export const SUBMITTED = 'submitted';

export const TypeLabels = {
  [MEALS]: 'Meals',
  [EVENT_RADIO]: 'Event Radio',
  [WET_SPOT]: 'Wet Spot (Org Showers)'
};

export const TypeOptions = [
  ['Event Radio', EVENT_RADIO],
  ['Meals', MEALS],
  ['Wet Spot Access', WET_SPOT],
];

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

  @attr('boolean') pre_event_meals;
  @attr('boolean') event_week_meals;
  @attr('boolean') post_event_meals;

  @attr('boolean', {defaultValue: false}) is_allocated;

  get isEventRadio() {
    return this.type === EVENT_RADIO;
  }

  get isMealPass() {
    return this.type === MEALS;
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
    if (this.type === MEALS) {
      return buildMealsLabel({ pre: this.pre_event_meals, event: this.event_week_meals, post: this.post_event_meals}, MEALS_FULL_LABELS) + ' Eat Pass';
    }

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
