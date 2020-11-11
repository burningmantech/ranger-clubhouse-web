import Controller from '@ember/controller';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {tracked} from '@glimmer/tracking';

export default class MeTimesheetCorrectionsReviewController extends Controller {
  @tracked entry = null; // Incorrect entry

  correctionValidations = {
    additional_notes: [validatePresence({presence: true})]
  };

  // Mark an entry as correct
  @action
  markCorrectAction(timesheet) {
    timesheet.review_status = 'verified';
    this.toast.clear();
    timesheet.save().then(() => {
      this.toast.success('The entry has been marked as correct.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Setup to mark an entry as incorrect - i.e. display the form
  @action
  markIncorrectAction(timesheet) {
    this.entry = timesheet;
  }

  // Save correction notes
  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();
    model.review_status = 'unverified';
    model.save().then(() => {
      this.entry = null;
      this.set('timesheetInfo.timesheet_confirmed', 0);
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // Cancel out the correction request - i.e. hide the form
  @action
  cancelCorrectionAction() {
    this.entry = null;
  }
}
