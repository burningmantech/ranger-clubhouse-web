import Component from '@ember/component';
import { computed } from '@ember/object';

export default class ScheduleTableComponent extends Component {
  tagName = '';

  // Available slots signed up for
  slots = null;
  person = null;
  year = null;
  creditsEarned = null;
  leaveSlot = null;
  showPeople = null;

  scheduleSummary = null;

  viewSchedule = 'upcoming';

  init() {
    super.init(...arguments);
    this.set('viewSchedule', this.isCurrentYear ? 'upcoming' : 'all');
  }

  @computed('year')
  get isCurrentYear() {
    return this.year == this.house.currentYear();
  }

  @computed('slots.[]', 'viewSchedule')
  get viewSlots() {
    const viewSchedule = this.viewSchedule;
    const slots = this.slots;

    if (viewSchedule != 'upcoming') {
      return slots;
    }

    return slots.filter((slot) => !slot.has_started)
  }

  @computed('slots.[]')
  get upcomingCount() {
    const slots = this.slots;
    return slots.reduce(function(upcoming, slot) { return (slot.has_started ? 0 : 1)+upcoming; }, 0);
  }

  @computed('viewSlots')
  get overlapping() {
    return this.viewSlots.reduce(function(total, slot) { return (slot.is_overlapping ? 1 : 0)+total;}, 0);
  }
}
