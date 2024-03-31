import Component from '@glimmer/component';
import {HQ_TODO_VERIFY_TIMESHEET} from "clubhouse/constants/hq-todo";
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import positionsForTimesheetMissing from "clubhouse/utils/positions-for-timesheet-missing";
import {STATUS_UNVERIFIED, STATUS_VERIFIED} from "clubhouse/models/timesheet";

export default class HqTimesheetVerificationComponent extends Component {
  @service ajax;
  @service house;
  @service store;
  @service toast;

  @tracked showCorrectionForm = false;
  @tracked entry = null;

  @tracked positionOptions;
  @tracked timesheetMissingEntry;

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */

  get hasUnreviewedTimesheet() {
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
    const isVerified = entry.review_status === STATUS_VERIFIED;
    entry.review_status = (isVerified ? STATUS_UNVERIFIED : STATUS_VERIFIED);
    try {
      await entry.save();
      this.toast.success(`Timesheet was successfully ${isVerified ? 'un-verified' : 'marked as verified'}.`);
      this._finishedCallbacks();
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
    this._finishedCallbacks();
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
  savedEntryCorrection() {
    this.entry.additional_notes = null; // pseudo field, not cleared on save
    this.entry.isIgnoring = false;
    this.showCorrectionForm = false;
    this._finishedCallbacks();
  }

  _finishedCallbacks() {
    if (this.hasUnreviewedTimesheet) {
      return;
    }
    this.args.completeTodo(HQ_TODO_VERIFY_TIMESHEET);
    this.args.onFinished?.();
  }

  @action
  skipEntireReview() {
    this.args.unverifiedTimesheets.filter((t) => (t.isUnverified && !t.isIgnoring)).forEach((t) => t.isIgnoring = true);
    this._finishedCallbacks();
    this.toast.success('Timesheet review has been skipped.');
  }

  /**
   * Start a new timesheet missing request
   */

  @action
  newTimesheetMissingRequest() {
    this.positionOptions = positionsForTimesheetMissing(this.args.positions);
    this.timesheetMissingEntry = this.store.createRecord('timesheet-missing', {
      person_id: this.args.person.id,
      position_id: this.positionOptions[0][1],
    });
  }

  @action
  closeTimesheetMissing() {
    this.timesheetMissingEntry = null;
  }
}
