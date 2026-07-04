import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {HQ_TODO_VERIFY_TIMESHEET} from "clubhouse/constants/hq-todo";
import {STATUS_UNVERIFIED, STATUS_VERIFIED} from "clubhouse/models/timesheet";
import {isUnreviewedTimesheet} from "clubhouse/controllers/hq/shift";

const VERIFIED_MESSAGE = 'Timesheet was successfully marked as verified.';
const UNVERIFIED_MESSAGE = 'Timesheet was successfully un-verified.';
const SKIPPED_MESSAGE = 'Timesheet review has been skipped.';

export default class HqTimesheetVerificationComponent extends Component {
  @service saveModel;
  @service store;
  @service toast;

  @tracked showCorrectionForm = false;
  @tracked entry = null;

  // The entry whose verification action is currently being saved. While set,
  // all of that entry's action buttons are disabled to prevent a double-fire.
  @tracked pendingEntry = null;

  @tracked timesheetMissingEntry;

  constructor() {
    super(...arguments);

    this.args.registerCorrectionAction(this.markEntryIncorrect);
  }

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */

  get hasUnreviewedTimesheet() {
    return !!(this.args.unverifiedTimesheets ?? []).find(isUnreviewedTimesheet);
  }

  /**
   * Mark a timesheet entry as correct/verified (or toggle it back to unverified).
   * The mutation is rolled back automatically if the save fails.
   *
   * @param {TimesheetModel} entry
   */

  @action
  async toggleEntryVerified(entry) {
    if (this.pendingEntry) {
      return;
    }

    this.pendingEntry = entry;
    entry.isIgnoring = false;
    const wasVerified = entry.isVerified;
    entry.review_status = (wasVerified ? STATUS_UNVERIFIED : STATUS_VERIFIED);

    try {
      const success = await this.saveModel.save({
        model: entry,
        message: entry.isVerified ? VERIFIED_MESSAGE : UNVERIFIED_MESSAGE,
      });
      if (success) {
        this._finishedCallbacks();
      }
    } finally {
      this.pendingEntry = null;
    }
  }

  /**
   * Show the incorrect entry form dialog.
   * Note: may be called by the parent component.
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
    if (this.pendingEntry) {
      return;
    }

    entry.isIgnoring = true;
    this._finishedCallbacks();
  }


  /**
   * Cancel the incorrect entry dialog.
   */

  @action
  cancelEntryCorrection() {
    this._resetCorrectionState();
  }

  /**
   * The correction request was submitted successfully. Close the dialog and,
   * if every entry has now reached a reviewed/ignored state, fire the
   * completion callbacks. Completion is based on the entry's persisted
   * review_status, which the correction save has already updated.
   */

  @action
  savedEntryCorrection() {
    if (this.entry) {
      this.entry.isIgnoring = false;
    }
    this._resetCorrectionState();
    this._finishedCallbacks();
  }

  /**
   * Close the correction dialog and clear its transient state. The
   * `additional_notes` pseudo field is not cleared by a save, so it must be
   * reset here for both the cancel and saved paths.
   */

  _resetCorrectionState() {
    if (this.entry) {
      this.entry.additional_notes = null; // pseudo field, not cleared on save
    }
    this.entry = null;
    this.showCorrectionForm = false;
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
    (this.args.unverifiedTimesheets ?? []).filter(isUnreviewedTimesheet).forEach((t) => t.isIgnoring = true);
    this._finishedCallbacks();
    this.toast.success(SKIPPED_MESSAGE);
  }

  /**
   * Start a new timesheet missing request
   */

  @action
  newTimesheetMissingRequest() {
    this.timesheetMissingEntry = this.store.createRecord('timesheet-missing', {
      person_id: this.args.person.id,
    });
  }

  @action
  closeTimesheetMissing() {
    // Discard an abandoned (never-saved) record so it does not linger in the store.
    if (this.timesheetMissingEntry?.isNew) {
      this.timesheetMissingEntry.deleteRecord();
    }
    this.timesheetMissingEntry = null;
  }
}
