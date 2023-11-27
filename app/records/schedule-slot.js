import {tracked} from '@glimmer/tracking';
import dayjs from 'dayjs';
import {TYPE_TRAINING} from "clubhouse/models/position";

export default class ScheduleSlotModel {
  @tracked isOverlapping = false;
  @tracked isSubmitting = false;
  @tracked isRetrievingSignUps = false;
  @tracked hasTrainingOverlap = false;

  @tracked overlappingSlots = [];
  @tracked person_assigned = false;
  @tracked signUpInfo = null;

  @tracked slot_signed_up = 0;

  constructor(data) {
    Object.assign(this, data);
  }

  get isFull() {
    return (this.slot_signed_up >= this.slot_max);
  }

  get slotDay() {
    const begins = this.slot_begins;
    let date;
    try {
      date = dayjs(begins).format('YYYY-MM-DD');
    } catch (error) {
      return begins + ' ' + error;
    }

    return date;
  }

  // Check to see if the url is just a url and nothing else
  get infoIsUrl() {
    const url = this.slot_url;

    if (!url) {
      return false;
    }

    return !!/^(https?:\/\/[^\s]+)$/.exec(url);
  }

  get isTraining() {
    return (this.position_type === TYPE_TRAINING);
  }

  get isNotPacific() {
    return this.slot_tz_abbr !== 'PST' && this.slot_tz_abbr !== 'PDT';
  }

  static hydrate(slots, positions) {
    const positionsById = positions.reduce((hash, row) => {
      hash[row.id] = row;
      return hash;
    }, {});

    return slots.map((row) => {
      const slot = new ScheduleSlotModel(row);
      const position = positionsById[slot.position_id];
      if (!position) {
        return;
      }
      slot.position_title = position.title;
      slot.position_count_hours = position.count_hours;
      slot.position_type = position.type;
      return slot;
    });
  }
}
