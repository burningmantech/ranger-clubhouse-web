import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {set} from '@ember/object';
import {ALPHA} from 'clubhouse/constants/positions';
import {tracked} from '@glimmer/tracking';

export default class HqShiftController extends ClubhouseController {
  @tracked showCorrectionForm = false;
  @tracked showSiteLeaveDialog = false;

  @tracked entry = null;
  @tracked isMarkingOffSite = false;

  @tracked timesheets;
  @tracked unverifiedTimesheets = [];
  @tracked onDutyEntry;

  @tracked assets;
  @tracked eventInfo;

  correctionValidations = {
    additional_notes: [validatePresence(true)]
  };

  /**
   * Figure out if the person is a Shiny Penny - i.e. their status is active, and
   * an Alpha shift was worked/walked.
   *
   * @returns {boolean}
   */

  get isShinyPenny() {
    return this.timesheets.find((t) => t.position_id === ALPHA) && this.person.isActive;
  }

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */
  get hasUnverifiedTimesheet() {
    return !!this.unverifiedTimesheets.find((t) => (t.isUnverified && !t.isIgnoring));
  }

  /**
   * Find all checked out assets
   * @returns {[]}
   */

  get assetsCheckedOut() {
    return this.assets.filter((a) => !a.checked_in);
  }

  /**
   * How many radios are currently checked out?
   *
   * @returns {number}
   */

  get radioCount() {
    return this.assetsCheckedOut.filter((a) => a.asset.description === 'Radio').length;
  }

  /**
   * How many shift radios are checked out?
   * (only used for people who are not event radio eligible)
   *
   * @returns {number}
   */

  get shiftRadios() {
    const radioCount = this.radioCount;
    const eventInfo = this.eventInfo;

    if (!eventInfo.radio_eligible) {
      // Not event radio eligible - assume all check outs are shift radios.
      return radioCount;
    }

    if (radioCount > eventInfo.radio_max) {
      return radioCount - eventInfo.radio_max;
    }

    return 0;
  }

  /**
   * How many event radios are checked out?
   *
   * @returns {number}
   */

  get eventRadios() {
    const radioCount = this.radioCount;
    const eventInfo = this.eventInfo;

    if (!eventInfo.radio_eligible) {
      return 0;
    }

    if (radioCount < eventInfo.radio_max) {
      return radioCount;
    } else {
      return eventInfo.radio_max;
    }
  }

  /**
   * Is person off duty
   *
   * @returns {boolean}
   */

  get isOffDuty() {
    return !this.timesheets.find((t) => t.stillOnDuty);
  }

  /**
   * Called when a shift was started.
   */

  @action
  startShiftNotify() {
    this.timesheets.update().then(() => this._findOnDuty());
  }

  /**
   * Called when the worker has ended a shift.
   * - Update the unverified timesheet list.
   * - Tell top level hq route to update the schedule summaries for the sidebar.
    */

  @action
  endShiftNotify() {
    this.timesheets.update().then(() => {
      this.unverifiedTimesheets = this.timesheets.filter((t) => t.isUnverified);
      this._findOnDuty()
    }).catch((response) => this.house.handleErrorResponse(response));

    this.send('updateTimesheetSummaries');
  }

  /**
   * Mark a timesheet entry as ignoring review for the moment. Typically used during burn perimeter check in
   * to send a Ranger quickly on their way without timesheet verification.
   *
   * @param {TimesheetModel} entry
   */

  @action
  ignoreEntry(entry) {
    entry.set('isIgnoring', true);
  }

  /**
   * Mark a timesheet entry as correct/verified.
   *
   * @param {TimesheetModel} entry
   */

  @action
  markEntryCorrect(entry) {
    entry.set('isIgnoring', false);
    entry.set('review_status', 'verified');
    entry.save()
      .then(() => this.toast.success('Timesheet was successfully marked correct.'))
      .catch((response) => this.house.handleErrorResponse(response));
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
  saveEntryCorrection(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    this.entry.set('isIgnoring', false);
    model.save().then(() => {
      this.entry.additional_notes = null; // pseudo field, not cleared on save
      this.showCorrectionForm = false;
      this.toast.success('Correction request was successfully submitted.');
    }).catch((response) => this.house.handleErrorResponse(response))
  }


  /**
   * Mark a person on or off site.
   *
   * @param {boolean} isOnSite
   * @private
   */
  _updateOnSite(isOnSite) {
    this.isMarkingOffSite = true;
    this.person.set('on_site', isOnSite);
    this.person.save().then(() => {
      this.toast.success(`${this.person.callsign} has been successfully marked ${isOnSite ? 'ON' : 'OFF'} SITE.`);
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isMarkingOffSite = false);
  }

  /**
   * Attempt to mark a person off site. Pop up a dialog if items are outstanding (checked out radios, unverified
   * shifts, etc.)
   */

  @action
  markOffSite() {
    if (this.pendingItems > 0) {
      // Person has outstanding items to deal with
      this.showSiteLeaveDialog = true;
    } else {
      // No outstanding items -- confirm just to be sure.
      this.modal.confirm('Confirm Marking Person Off Site',
        `Are you sure you wish to mark ${this.person.callsign} as OFF SITE?`,
        () => this._updateOnSite(false)
      );
    }
  }

  /**
   * Count how many of the following items the person has to deal with:
   * - Unverified timesheet entries
   * - Checked out assets
   * - Still on duty
   *
   * @returns {number}
   */

  get pendingItems() {
    let items = 0;

    if (!this.isOffDuty) {
      items++;
    }

    if (this.unverifiedTimesheets.length) {
      items++;
    }

    if (this.assetsCheckedOut.length) {
      items++;
    }

    return items++;
  }

  /**
   * Cancel the mark off site dialog
   */

  @action
  cancelSiteLeaveDialog() {
    this.showSiteLeaveDialog = false;
  }

  /**
   * Go ahead and force the off site even tho there are outstanding items.
   */

  @action
  forceMarkOffSite() {
    this._updateOnSite(false);
    this.showSiteLeaveDialog = false;
  }

  /**
   * Mark the person as on site.
   */

  @action
  markOnSite() {
    this._updateOnSite(true);
  }

  /**
   * Find the on duty entry
   *
   * @private
   */

  _findOnDuty() {
    this.onDutyEntry = this.timesheets.findBy('off_duty', null);
  }
}
