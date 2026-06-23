import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {cached, tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import dayjs from 'dayjs';
import {ALPHA} from "../../constants/positions";

export default class MentorShiftReportController extends ClubhouseController {
  queryParams = [ 'year', 'slot_id', 'on_duty' ];

  @tracked on_duty;
  @tracked year;
  @tracked slot_id;

  ALPHA_POSITION = ALPHA

  @tracked slots;
  @tracked report;

  @cached
  get slotOptions() {
    return [
      [ '---', null ],
      ...this.slots.map((s) => [ dayjs(s.begins).format('ddd MMM Do YYYY @ HH:mm'), s.id])
    ]
  }

  @action
  onDutyAction() {
    this.slot_id = null;
    this.on_duty = true;
  }

  @action
  setSlotId(slot_id) {
    this.slot_id = slot_id;
    this.on_duty = null;
  }

  @action
  setYear(year) {
    this.year = year;
    this.slot_id = null;
    this.on_duty = null;
  }
}

