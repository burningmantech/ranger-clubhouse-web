import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';

export default class MeTimesheetsReviewController extends Controller {
  incorrectTimesheet = null;

  corectionValidations = {
    notes: validatePresence({ presence: true})
  };

  timesheetInfo = {};

  @action
  markCorrectAction(timesheet) {
    timesheet.set('verified', 1);
    this.toast.clearMessages();
    timesheet.save().then(() => {
      this.toast.success('The timesheet has been marked as correct.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  markIncorrectAction(timesheet) {
    this.set('incorrectTimesheet', timesheet);
  }

  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clearMessages();
    model.set('verified', 0);
    model.save().then(() => {
      this.set('incorrectTimesheet', null);
      this.set('timesheetInfo.timesheet_confirmed', 0);
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  cancelCorrectionAction() {
    this.set('incorrectTimesheet', null);
  }
}
