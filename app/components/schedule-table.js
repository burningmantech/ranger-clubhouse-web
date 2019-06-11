import Component from '@ember/component';
import { action, computed } from '@ember/object';
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
  @argument(optional('object')) scheduleSummary;
  @argument(optional('object')) onChange;

  viewSchedule = 'upcoming';

  didReceiveAttrs() {
    this.set('viewSchedule', this.isCurrentYear ? 'upcoming' : 'all');
  }

  @computed('year')
  get isCurrentYear() {
    return this.year == this.house.currentYear();
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

  @computed('slots.@each.slot_duration')
  get totalDuration() {
    const slots = this.slots;

    if (slots) {
      return slots.reduce((sum, slot) => sum + slot.slot_duration, 0);
    } else {
      return 0;
    }
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

  @computed('slots')
  get trainingOverlap() {
    return this.slots.reduce(function(total, slot) { return (slot.is_training_overlap ? 1 : 0)+total;}, 0);
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
    let message;

    if (slot.has_started && this.session.user.isAdmin) {
      message = 'The shift has already started. Because you are an admin, you are allowed to removed the shift. '
    } else {
      message = '';
    }

    message += `Are you sure you want to remove "${slot.position_title} - ${slot.slot_description}" from the schedule?`

    this.modal.confirm(null, message, () => {
        const personId = this.person.id;
        const slotId = slot.id;

        this.ajax.request(`person/${personId}/schedule/${slotId}`, {
          method: 'DELETE',
        }).then((result) => {
          slot.set('person_assigned', false);
          slot.set('slot_signed_up', result.signed_up);
          if (this.onChange) {
            this.onChange();
          }
        }).catch((response) => {
          this.house.handleErrorResponse(response);
        })
      }
    );
  }

  @action
  printPage() {
    window.print();
  }
}
