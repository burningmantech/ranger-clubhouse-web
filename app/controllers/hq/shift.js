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
    notes:[ validatePresence(true)]
  };

  @computed('person.isActive', 'timesheets.@each.position_id')
  get isShinyPenny() {
    return this.timesheets.find((t) => t.position_id == ALPHA) && this.person.isActive;
  }

  @computed('unverifiedTimesheets.@each.isUnverified')
  get hasUnverifiedTimesheets() {
    const r =  !!this.unverifiedTimesheets.find((t) => t.isUnverified);
    console.log("Have unverified?",r);
    return r;
  }

  @computed('assets.@each.checked_in')
  get assetsCheckedOut() {
    return this.assets.filter((a) => !a.checked_in);
  }

  @computed('assetsCheckedOut')
  get radioCount() {
    return this.assetsCheckedOut.filter((a) => a.asset.description === 'Radio').length;
  }

  @computed('eventInfo', 'radioCount')
  get shiftRadios() {
    const radioCount = this.radioCount;
    const eventInfo = this.eventInfo;

    if (!eventInfo.radio_eligible) {
      return radioCount;
    }

    if (radioCount > eventInfo.radio_max) {
      return radioCount - eventInfo.radio_max;
    }

    return 0;
  }

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

  @computed('timesheets.@each.stillOnDuty')
  get isOffDuty() {
    return this.timesheets.find((t) => t.stillOnDuty) === undefined;
  }

  @action
  refreshTimesheetSummary() {
    // Called when the shift has ended.. need to refresh the timesheet summary.
    this.send('refreshHQSidebar');
  }

  @action
  ignoreEntry(entry) {
    entry.set('isIgnoring', true);
  }

  @action
  markEntryCorrect(entry) {
    entry.set('isIgnoring', false);
    entry.set('verified', true);
    entry.save().then(() => {
      this.toast.success('Timesheet was successfully marked correct.');
    })
      .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  markEntryIncorrect(entry) {
    this.entry = entry;
    this.showCorrectionForm =  true;
  }

  @action
  cancelEntryCorrection() {
    this.entry = null;
    this.showCorrectionForm = false;
  }

  @action
  saveEntryCorrection(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    this.entry.set('isIgnoring', false);
    model.save().then(() => {
      this.showCorrectionForm = false;
      this.toast.success('Correction request was successfully submitted.');
    }).catch((response) => this.house.handleErrorResponse(response))
  }

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

  _updateOnSite(on_site) {
    this.isMarkingOffSite = true;
    this.person.set('on_site', on_site);
    this.person.save().then(() => {
      this.toast.success(`${this.person.callsign} has been successfully marked ${on_site ? 'ON' : 'OFF'} SITE.`);
    })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isMarkingOffSite = false);
  }

  @action
  markOffSite() {
    if (this.pendingItems > 0) {
      this.showSiteLeaveDialog = true;
    } else {
      this.modal.confirm('Confirm Marking Person Off Site',
        `Are you sure you wish to mark ${this.person.callsign} as OFF SITE?`,
        () => {
          this._updateOnSite(false)
        });
    }
  }

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

  @action
  cancelSiteLeaveDialog() {
    this.showSiteLeaveDialog = false;
  }

  @action
  forceMarkOffSite() {
    this._updateOnSite(false);
    this.showSiteLeaveDialog = false;
  }

  @action
  markOnSite() {
    this._updateOnSite(true);
  }

  @computed('creditsEarned', 'expected.credits', 'timesheetSummary.total_credits')
  get creditsExpected() {
    return this.timesheetSummary.total_credits + this.expected.credits;
  }

  @computed('timesheetSummary.counted_duration', 'expected.duration')
  get countedDurationExpected() {
    return this.timesheetSummary.counted_duration + this.expected.duration;
  }

  @computed('timesheetSummary.total_duration', 'expected.duration')
  get totalDurationExpected() {
    return this.timesheetSummary.total_duration + this.expected.duration;
  }

  @action
  toggleHoursCreditBreakdown() {
    this.showHoursCreditsBreakdown =  !this.showHoursCreditsBreakdown;
  }
}
