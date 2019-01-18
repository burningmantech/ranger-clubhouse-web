import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class ScheduleTableComponent extends Component {
  // Available slots signed up for
  @argument('object') slots;
  @argument('object') person;
  @argument('number') year;
  @argument('number') creditsEarned;

  viewSchedule = 'upcoming';

  didReceiveAttrs() {
    this.set('viewSchedule', this.isCurrentYear ? 'upcoming' : 'all');
  }

  @computed('year')
  get isCurrentYear() {
    return this.year == (new Date()).getFullYear();
  }

  @computed('slots')
  get creditsTotal() {
    let creditsTotal = 0.0;
    const slots = this.slots;

    if (slots) {
      creditsTotal = slots.reduce((sum, slot) => sum + slot.credits, 0.0);
    }

    return creditsTotal;
  }

  @computed('slots')
  get totalDuration() {
    let totalDuration = 0;

    const slots = this.slots;

    if (slots) {
      totalDuration = slots.reduce((sum, slot) => sum + slot.slot_duration, 0);
    }

    return totalDuration;
  }

  @computed('slots', 'viewSchedule')
  get viewSlots() {
    const viewSchedule = this.viewSchedule;
    const slots = this.slots;

    if (viewSchedule != 'upcoming') {
      return slots;
    }

    return slots.filter((slot) => !slot.has_started)
  }

  @computed('slots')
  get upcomingCount() {
    const slots = this.slots;
    return slots.reduce(function(upcoming, slot) { return (slot.has_started ? 0 : 1)+upcoming; }, 0);
  }

  @computed('slots')
  get overlapping() {
    return this.slots.reduce(function(total, slot) { return (slot.is_overlapping ? 1 : 0)+total;}, 0);
  }

  @action
  changeView(value) {
    this.set('viewSchedule', value);
  }

  @action
  showPeople(slot) {
    this.ajax.request('slot/'+slot.id+'/people')
      .then((result) => {
        const callsigns = result.people.map(function (person) { return person.callsign; })
        this.modal.info(slot.slot_begins+' '+slot.slot_description, callsigns.join(', '));
      })
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  leaveSlot(slot) {
    this.modal.confirm(
      'Confirm removal',
        `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`,
      () => {
        const personId = this.person.id;
        const slotId = slot.id;

        this.ajax.request(`person/${personId}/schedule/${slotId}`, {
          method: 'DELETE',
        }).then(() => {
          slot.set('person_assigned', false);
        }).catch((response) => {
          this.house.handleErrorResponse(response);
        })
      }
    );
  }
}
