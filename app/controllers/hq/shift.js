import Controller from '@ember/controller';
import {action, computed} from '@ember/object';
import {validatePresence} from 'ember-changeset-validations/validators';
import {set} from '@ember/object';
import { ALPHA } from 'clubhouse/constants/positions';
import { tracked } from '@glimmer/tracking';

export default class HqShiftController extends Controller {
  @tracked showCorrectionForm = false;
  @tracked showSiteLeaveDialog = false;
  @tracked entry = null;
  @tracked isMarkingOffSite = false;
  @tracked showHoursCreditsBreakdown = false;
  @tracked unverifiedTimesheets = [];

  correctionValidations = {
    additional_notes:[ validatePresence(true)]
  };

  /**
   * Figure out if the person is a Shiny Penny - i.e. their status is active, and
   * an Alpha shift was worked/walked.
   *
   * @returns {boolean}
   */
  @computed('person.isActive', 'timesheets.@each.position_id')
  get isShinyPenny() {
    return this.timesheets.find((t) => t.position_id == ALPHA) && this.person.isActive;
  }

  /**
   * Are there any unverified and not being ignored timesheet entries?
   * (used to determine if Start Shift can be shown)
   *
   * @returns {boolean}
   */
  get hasUnverifiedTimesheet() {
    return !!this.timesheets.find((t) => (t.isUnverified && !t.isIgnoring));
  }

  /**
   * Find all checked out assets
   * @returns {[]}
   */
  @computed('assets.@each.checked_in')
  get assetsCheckedOut() {
    return this.assets.filter((a) => !a.checked_in);
  }

  /**
   * How many radios are currently checked out?
   *
   * @returns {number}
   */
  @computed('assetsCheckedOut')
  get radioCount() {
    return this.assetsCheckedOut.filter((a) => a.asset.description === 'Radio').length;
  }

  /**
   * How many shift radios are checked out?
   * (only used for people who are not event radio eligible)
   *
   * @returns {number}
   */
  @computed('eventInfo', 'radioCount')
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

  @computed('eventInfo', 'radioCount')
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
  @computed('timesheets.@each.stillOnDuty')
  get isOffDuty() {
    return this.timesheets.find((t) => t.stillOnDuty) === undefined;
  }

  /**
   * Called when the worker has ended a shift. Update the unverified timesheet list.
   */

  @action
  endShiftAction() {
    this.unverifiedTimesheets = this.timesheets.filter((t) => t.isUnverified);
  }

  /**
   * Mark a timesheet entry as ignoring review for the moment. Typically used during burn perimeter check in
   * to send a Ranger quickly on their way without timesheet verification.
   * @param entry
   */

  @action
  ignoreEntry(entry) {
    entry.set('isIgnoring', true);
  }

  /**
   * Mark a timesheet entry as correct/verified.
   *
   * @param entry
   */
  @action
  markEntryCorrect(entry) {
    entry.set('isIgnoring', false);
    entry.set('review_status', 'verified');
    entry.save().then(() => {
      this.toast.success('Timesheet was successfully marked correct.');
    })
      .catch((response) => this.house.handleErrorResponse(response));
  }

  /**
   * Show the incorrect entry form dialog.
   * @param entry
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
   * @param model
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
   * Check in a checked out asset
   *
   * @param ap
   */
  @action
  assetCheckInAction(ap) {
    set(ap, 'isSubmitting', true);
    this.ajax.request(`asset/${ap.asset.id}/checkin`, {method: 'POST'})
      .then((result) => {
        set(ap, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(ap, 'isSubmitting', false));
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
        () => {
          this._updateOnSite(false)
        });
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
   * How many expected credits the person might earn. (earned credits + scheduled credits)
   *
   * @returns {number}
   */
  @computed('creditsEarned', 'expected.credits', 'timesheetSummary.total_credits')
  get creditsExpected() {
    return this.timesheetSummary.total_credits + this.expected.credits;
  }

  /**
   * How many seconds counted towards appreciations the person might work. (worked seconds + scheduled seconds)
   * @returns {number}
   */

  @computed('timesheetSummary.counted_duration', 'expected.duration')
  get countedDurationExpected() {
    return this.timesheetSummary.counted_duration + this.expected.duration;
  }

  /**
   * How many total seconds (counted towards appreciation plus everything else) the person might
   * work.
   * @returns {number}
   */

  @computed('timesheetSummary.total_duration', 'expected.duration')
  get totalDurationExpected() {
    return this.timesheetSummary.total_duration + this.expected.duration;
  }

  /**
   * Toggle the hours & credits breakdown dialog
   */

  @action
  toggleHoursCreditBreakdown() {
    this.showHoursCreditsBreakdown =  !this.showHoursCreditsBreakdown;
  }
}
