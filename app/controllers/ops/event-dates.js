import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import dayjs from 'dayjs';
import {TECH_NINJA} from "clubhouse/constants/roles";

export default class AdminEventDatesController extends ClubhouseController {
  eventDateValidations = {
    event_start: [validateDateTime({before: 'event_end'}), validatePresence(true)],
    event_end: [validateDateTime({after: 'event_start'}), validatePresence(true)],

    pre_event_start: [validateDateTime({before: 'post_event_end'}), validatePresence(true)],
    post_event_end: [validateDateTime({after: 'pre_event_start'}), validatePresence(true)],

    pre_event_slot_start: [validateDateTime({before: 'pre_event_slot_end'}), validatePresence(true)],
    pre_event_slot_end: [validateDateTime({after: 'pre_event_slot_start'}), validatePresence(true)],
  };

  @tracked entry;

  get canEditRecords() {
    return this.session.hasRole(TECH_NINJA);
  }

  @action
  save(model, isValid) {
    if (!isValid)
      return;

    const eventYear = dayjs(model.event_start).year();
    const mismatches = [];

    // Verify all years match
    ['event_end', 'post_event_end', 'pre_event_slot_end', 'pre_event_slot_start', 'pre_event_start'].forEach((column) => {
      const value = model[column];
      if (value && dayjs(value).year() != eventYear) {
        mismatches.push(column);
      }
    });

    if (mismatches.length > 0) {
      this.modal.info('Year Mistmatch',
        `All fields must have the same year as the event start. The following fields have a different year: ${mismatches.join(', ')}`);
      return;
    }

    const isNew = this.entry.isNew;

    model.save().then(() => {
      this.entry = null;
      this.eventDates.update()
        .catch((response) => this.house.handleErrorResponse(response))
        .finally(() => this.entry = null);
      this.toast.success(`Event Date was successfully ${isNew ? 'created' : 'updated'}.`);
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  cancel() {
    this.entry = null;
  }

  @action
  edit(eventDate) {
    this.entry = eventDate;
  }

  @action
  newRecord() {
    this.entry = this.store.createRecord('event-date');
  }
}
