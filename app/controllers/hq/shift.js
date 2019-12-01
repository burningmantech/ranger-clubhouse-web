import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import { set } from '@ember/object';
import * as Position from 'clubhouse/constants/positions';

export default class HqShiftController extends Controller {
  ignoreTimesheetVerification = false;
  showCorrectionForm = false;

  correctionValidations = {
    notes: validatePresence(true)
  };

  @computed('timesheets.@each.position_id')
  get isShinyPenny() {
    return this.timesheets.find((t) => t.position_id == Position.ALPHA) && this.person.isActive;
  }

  @computed('timesheets.@each.isUnverified')
  get unverifiedTimesheets() {
    return this.timesheets.filter((ts) => ts.isUnverified);
  }

  @computed('unverifiedTimesheets')
  get unverifiedTimesheetEntry() {
    return this.unverifiedTimesheets.firstObject;
  }

  @computed('assets.@each.checked_in')
  get assetsCheckedOut() {
    return this.assets.filter((a) => !a.checked_in);
  }

  @computed('assetsCheckedOut')
  get radioCount() {
    return this.assetsCheckedOut.filter((a) => a.asset.description == 'Radio').length;
  }

  @computed('radioCount')
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

  @computed('radioCount')
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
    return this.timesheets.find((t) => t.stillOnDuty) == undefined;
  }

  @action
  refreshTimesheetSummary() {
    // Called when the shift has ended.. need to refresh the timesheet summary.
    this.send('refreshHQSidebar');
  }

  @action
  toggleIgnoreVerification() {
    this.set('ignoreTimesheetVerification', !this.ignoreTimesheetVerification);
  }

  @action
  markEntryCorrect() {
    const entry = this.unverifiedTimesheetEntry;

    this.toast.clear();

    this.set('isSubmitting', true);
    entry.set('verified', true);
    entry.save().then(() => {
        this.toast.success('Timesheet was successfully marked correct.');
        this.set('entry', null);
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isSubmitting', false));
  }

  @action
  markEntryIncorrect() {
    this.set('entry', this.unverifiedTimesheetEntry);
    this.set('showCorrectionForm', true);
  }

  @action
  cancelEntryCorrection() {
    this.set('entry', null);
    this.set('showCorrectionForm', false);
  }

  @action
  saveEntryCorrection(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    this.set('isCorrectionSubmitting', true);
    model.save().then(() => {
        this.set('showCorrectionForm', false);
        this.toast.success('Correction request was succesfully submitted.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isCorrectionSubmitting', false));
  }

  @action
  assetCheckInAction(ap) {
    set(ap, 'isSubmitting', true);
    this.ajax.request(`asset/${ap.asset.id}/checkin`, { method: 'POST' })
      .then((result) => {
        set(ap, 'checked_in', result.checked_in);
        this.toast.success('Asset has been successfully checked in.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(ap, 'isSubmitting', false));
  }

  _updateOnSite(on_site) {
    this.set('isMarkingOffSite', true);
    this.person.set('on_site', on_site);
    this.person.save().then(() => {
        this.toast.success(`${this.person.callsign} has been successfully marked ${on_site ? 'ON' : 'OFF'} SITE.`);
      })
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.set('isMarkingOffSite', false));
  }

  @action
  markOffSite() {
    if (this.assetsCheckedOut.length ||
      this.unverifiedTimesheets.length ||
      !this.isOffDuty) {

      this.modal.open('modal-site-leave', {
        assetsCheckedOut: this.assetsCheckedOut,
        isOnDuty: !this.isOffDuty,
        unverifiedTimesheetCount: this.unverifiedTimesheets.length,
      }, () => { this._updateOnSite(false) });
    } else {
      this.modal.confirm('Confirm Marking Person Off Site',
        `Are you sure you wish to mark ${this.person.callsign} as OFF SITE?`,
        () => { this._updateOnSite(false) });
    }
  }

  @action
  markOnSite() {
    this._updateOnSite(true);
  }

  @computed('creditsEarned', 'expected.credits')
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
    this.set('showHoursCreditsBreakdown', !this.showHoursCreditsBreakdown);
  }

  @computed('eventInfo.meals')
  get mealInfo() {
    switch (this.eventInfo.meals) {
    case 'all':
      return 'NO POG - has Eat It All BMID';
    case 'pre':
      return 'Event Week & Post';
    case 'post':
      return 'Pre- and Event Week';
    case 'event':
      return 'Pre-Event & Post-Event';
    case 'pre+event':
      return 'Post-Event';
    case 'event+post':
      return 'Pre-Event';
    case 'pre+post':
      return 'Event Week';
    case 'pogs':
    case null:
      return 'Every shift worked';
    default:
      return `Unknown ${this.eventInfo.meals}`;
    }
  }

}
