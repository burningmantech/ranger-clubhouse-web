import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

import { validatePresence } from 'ember-changeset-validations/validators';

export default class MeTimesheetReviewCommonComponent extends Component {
  @argument('object') timesheets;
  @argument(optional('object')) timesheetInfo;
  @argument(optional('object')) timesheetSummary;
  @argument('object') person;

  entry = null; // Incorrect entry

  correctionValidations = {
    notes: validatePresence({ presence: true })
  };

  @computed('person')
  get isMe() {
    return this.session.userId == this.person.id;
  }

  // Mark an entry as correct
  @action
  markCorrectAction(timesheet) {
    timesheet.set('verified', 1);
    this.toast.clear();
    this.set('isSubmitting', true);
    timesheet.save().then(() => {
      this.set('isSubmitting', false);
      this.toast.success('The entry has been marked as correct.');
    }).catch((response) => {
      this.set('isSubmitting', false);
      timesheet.rollback();
      this.house.handleErrorResponse(response);
    });
  }

  // Setup to mark an entry as incorrect - i.e. display the form
  @action
  markIncorrectAction(timesheet) {
    this.set('entry', timesheet);
  }

  // Save correction notes
  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    if (!model.get('isDirty')) {
      this.set('entry', null);
      this.modal.info('', 'You did not enter a new correction note. The correction was not submitted.');
      return;
    }

    model.set('verified', 0);
    model.set('is_incorrect', 1);

    this.set('isSubmitting', true);

    model.save().then(() => {
      this.set('entry', null);
      this.set('isSubmitting', false);
      if (this.timesheetInfo) {
        this.set('timesheetInfo.timesheet_confirmed', 0);
      }
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => {
      this.set('isSubmitting', false);
      this.house.handleErrorResponse(response);
    });
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.set('entry', null);
  }
}
