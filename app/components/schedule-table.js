import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ScheduleTableComponent extends Component {
  @service house;

  @tracked viewSchedule;

  constructor() {
    super(...arguments);
    this.viewSchedule = this.isCurrentYear ? 'upcoming' : 'all';
  }

  get isCurrentYear() {
    return this.args.year == this.house.currentYear();
  }

  @computed('args.slots.[]', 'viewSchedule')
  get viewSlots() {
    const slots = this.args.slots;

    if (this.viewSchedule != 'upcoming') {
      return slots;
    }

    return slots.filter((slot) => !slot.has_started)
  }

  @computed('args.slots.[]')
  get upcomingCount() {
    const slots = this.args.slots;
    return slots.reduce(function(upcoming, slot) { return (slot.has_started ? 0 : 1)+upcoming; }, 0);
  }

  @computed('viewSlots')
  get hasOverlapping() {
    return this.viewSlots.reduce(function(total, slot) { return (slot.is_overlapping ? 1 : 0)+total;}, 0);
  }
}
