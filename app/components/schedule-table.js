import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {action} from '@ember/object';

export default class ScheduleTableComponent extends Component {
  @service house;
  @tracked viewSchedule;

  constructor() {
    super(...arguments);
    this.isCurrentYear = (this.args.year == this.house.currentYear());
    this.viewSchedule = this.isCurrentYear ? 'upcoming' : 'all';
  }

  @action
  showAllAction() {
    this.viewSchedule = 'all';
  }

  @action
  showUpcomingAction() {
    this.viewSchedule = 'upcoming';
  }

  get viewSlots() {
    const slots = this.args.slots;

    if (this.viewSchedule !== 'upcoming') {
      return slots;
    }

    return slots.filter((slot) => !slot.has_started)
  }

  get upcomingCount() {
    const {slots} = this.args;
    return slots.reduce(function (upcoming, slot) {
      return (slot.has_started ? 0 : 1) + upcoming;
    }, 0);
  }

  get hasOverlapping() {
    return this.viewSlots.reduce(function (total, slot) {
      return (slot.is_overlapping ? 1 : 0) + total;
    }, 0);
  }
}
