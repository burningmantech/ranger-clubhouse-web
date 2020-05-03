import Component from '@ember/component';
import { action, computed } from '@ember/object';



import { validatePresence } from 'ember-changeset-validations/validators';

export default class MeTimesheetReviewCommonComponent extends Component {
  timesheets = null;
  timesheetInfo = null;
  timesheetSummary = null;
  person = null;

  entry = null; // Incorrect entry

  correctionValidations = {
    notes: validatePresence({ presence: true })
  };

  @computed('person.id', 'session.userId')
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
    timesheet.reload().then(() => {
      this.set('entry', timesheet);
    }).catch((response) => this.house.handleErrorResponse(response))
  }

  // Save correction notes
  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    if (!model.get('isDirty')) {
      this.modal.info('Enter More Information', 'You did not add to the correction note.');
      return;
    }

    model.set('verified', 0);

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
