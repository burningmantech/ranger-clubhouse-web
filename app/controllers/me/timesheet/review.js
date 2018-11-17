import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class MeTimesheetsReviewController extends Controller {
  entry = null; // Incorrect entry

  corectionValidations = {
    notes: validatePresence({ presence: true})
  };

  // Mark an entry as correct
  @action
  markCorrectAction(timesheet) {
    timesheet.set('verified', 1);
    this.toast.clearMessages();
    timesheet.save().then(() => {
      this.toast.success('The timesheet has been marked as correct.');
    }).catch((response) => this.house.handleErrorResponse(response));
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

    this.toast.clearMessages();
    model.set('verified', 0);
    model.save().then(() => {
      this.set('entry', null);
      this.set('timesheetInfo.timesheet_confirmed', 0);
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.set('entry', null);
  }
}
