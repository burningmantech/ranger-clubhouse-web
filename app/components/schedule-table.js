import Component from '@ember/component';
import { computed } from '@ember/object';
import { optional } from '@ember-decorators/argument/types';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ScheduleTableComponent extends Component {
  // Available slots signed up for
  @argument('object') slots;
  @argument('object') person;
  @argument('number') year;
  @argument('number') creditsEarned;
  @argument('object') leaveSlot;
  @argument('object') showPeople;

  @argument(optional('object')) scheduleSummary;

  viewSchedule = 'upcoming';

  didReceiveAttrs() {
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

  @computed('slots.[]')
  get overlapping() {
    return this.slots.reduce(function(total, slot) { return (slot.is_overlapping ? 1 : 0)+total;}, 0);
  }
}
