import Component from '@glimmer/component';
import { action } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class MeTimesheetReviewCommonComponent extends Component {
  @service toast;
  @service session;

  @tracked entry = null; // Incorrect entry

  correctionValidations = {
    additional_notes: [validatePresence({ presence: true })]
  };

  get isMe() {
    return this.session.userId == this.args.person.id;
  }

  /**
   * Mark a timesheet as correct.
   *
   * @param timesheet
   */
  @action
  markCorrectAction(timesheet) {
    timesheet.review_status = 'verified';
    timesheet.save().then(() => {
      this.toast.success('The entry has been marked as correct.');
    }).catch((response) => {
      timesheet.rollbackAttributes();
      this.house.handleErrorResponse(response, timesheet);
    });
  }

  /**
   * Setup to mark an entry as incorrect. Reload the entry to get the most recent version
   * and then show the incorrect form dialog.
   *
   * @param timesheet
   */
  @action
  markIncorrectAction(timesheet) {
    timesheet.reload().then(() => {
      this.entry = timesheet;
    }).catch((response) => this.house.handleErrorResponse(response, timesheet))
  }

  /**
   * Mark an entry as incorrect, record the note, and dismiss the dialog.
   * @param model
   * @param {boolean} isValid
   */

  @action
  saveCorrectionAction(model, isValid) {
    if (!isValid) {
      return;
    }

    model.review_status = 'pending';

    model.save().then(() => {
      this.entry.additional_notes = ''; // pseudo-field, clear out by hand.
      this.entry = null;
      if (this.timesheetInfo) {
        this.timesheetInfo.timesheet_confirmed =  0;
      }
      this.toast.success('Your correction note has been submitted.');
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  /**
   * Dismiss the incorrect dialog.
   */

  @action
  cancelCorrectionAction() {
    this.entry = null;
  }
}
