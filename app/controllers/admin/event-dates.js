import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import moment from 'moment';

export default class AdminEventDatesController extends Controller {
  eventDateValidations = {
    event_start:  [ validateDateTime({ before: 'event_end' }), validatePresence(true) ],
    event_end:  [ validateDateTime({ after: 'event_start' }), validatePresence(true) ],

    pre_event_start:  [ validateDateTime({ before: 'post_event_end' }), validatePresence(true) ],
    post_event_end:  [ validateDateTime({ after: 'pre_event_start' }), validatePresence(true) ],

    pre_event_slot_start:  [ validateDateTime({ before: 'pre_event_slot_end' }), validatePresence(true) ],
    pre_event_slot_end:  [ validateDateTime({ after: 'pre_event_slot_start' }), validatePresence(true) ],
  };

  @action
  save(model, isValid) {
    if (!isValid)
      return;

    const eventYear = moment(model.get('event_start')).year();
    const mismatches = [];

    // Verify all years match
    [ 'event_end', 'post_event_end', 'pre_event_slot_end', 'pre_event_slot_start', 'pre_event_start' ].forEach((column) => {
      const value = model.get(column);
      if (value && moment(value).year() != eventYear) {
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
        if (isNew) {
          this.eventDates.push(this.entry);
          this.eventDates.sortBy('event_start');
        }

        this.set('entry', null);
        this.toast.succes(`Event Date succesfully ${isNew ? 'created' : 'updated'}.`);
    });
  }

  @action
  cancel() {
    this.set('entry', null);
  }

  @action
  edit(eventDate) {
    this.set('entry', eventDate);
  }

  @action
  newRecord() {
    this.set('entry', this.store.createRecord('event-date'));
  }
}
