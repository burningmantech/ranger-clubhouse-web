import Component from '@glimmer/component';
import {HQ_TODO_VERIFY_TIMESHEET} from "clubhouse/constants/hq-todo";
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class HqTimesheetVerificationComponent extends Component {

  @service ajax;
  @service house;
  @service toast;

  @tracked showCorrectionForm = false;
  @tracked entry = null;

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */

  get hasUnverifiedTimesheet() {
    return !!this.args.unverifiedTimesheets.find((t) => (t.isUnverified && !t.isIgnoring));
  }

  /**
   * Mark a timesheet entry as correct/verified.
   *
   * @param {TimesheetModel} entry
   */

  @action
  async toggleEntryVerified(entry) {
    entry.isIgnoring = false;
    const isVerified = entry.review_status === 'verified';
    entry.review_status = (isVerified ? 'unverified' : 'verified');
    try {
      await entry.save();
      this.toast.success(`Timesheet was successfully ${isVerified ? 'un-verified' : 'marked as verified'}.`);
      if (!this.hasUnverifiedTimesheet) {
        this.args.completeTodo(HQ_TODO_VERIFY_TIMESHEET);
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Show the incorrect entry form dialog.
   *
   * @param {TimesheetModel} entry
   */
  @action
  markEntryIncorrect(entry) {
    this.entry = entry;
    this.showCorrectionForm = true;
  }

  /**
   * Mark a timesheet entry as ignoring review for the moment. Typically used during burn perimeter check in
   * to send a Ranger quickly on their way without timesheet verification.
   *
   * @param {TimesheetModel} entry
   */

  @action
  ignoreEntry(entry) {
    entry.isIgnoring = true;

    if (!this.hasUnverifiedTimesheet) {
      this.args.completeTodo(HQ_TODO_VERIFY_TIMESHEET);
    }
  }


  /**
   * Cancel the incorrect entry dialog.
   */

  @action
  cancelEntryCorrection() {
    this.entry.additional_notes = null; // pseudo field, not cleared on save
    this.showCorrectionForm = false;
  }

  /**
   * Mark an entry as incorrect with a note.
   *
   * @param {TimesheetModel} model
   * @param {boolean} isValid
   */

  @action
  async saveEntryCorrection(model, isValid) {
    if (!isValid) {
      return;
    }

    this.entry.isIgnoring = false;
    try {
      await model.save();
      this.entry.additional_notes = null; // pseudo field, not cleared on save
      this.showCorrectionForm = false;
      this.toast.success('Correction request successfully submitted.');
      if (!this.hasUnverifiedTimesheet) {
        this.args.completeTodo(HQ_TODO_VERIFY_TIMESHEET);
      }
    } catch (response) {
      this.house.handleErrorResponse(response)
    }
  }
}
