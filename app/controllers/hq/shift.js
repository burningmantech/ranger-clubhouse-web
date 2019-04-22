import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { validatePresence } from 'ember-changeset-validations/validators';
import { set } from '@ember/object';

export default class HqShiftController extends Controller {
  ignoreTimesheetVerification = false;
  showCorrectionForm = false;

  correctionValidations = {
    notes: validatePresence(true)
  };

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

  @computed('timesheets.@each.stillOnDuty')
  get isOffDuty() {
    return this.timesheets.find((t) => t.stillOnDuty) == undefined;
  }

  @action
  toggleIgnoreVerification() {
    this.set('ignoreTimesheetVerification', !this.ignoreTimesheetVerification);
  }

  @action
  markEntryCorrect() {
    const entry = this.unverifiedTimesheetEntry;

    this.toast.clear();

    entry.set('verified', true);
    this.set('isSubmitting', true);
    entry.save().then(() => {
      this.toast.success('Timesheet was successfully marked correct.');
      this.set('showCorrectionForm', false);
    })
    .catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }

  @action
  markEntryIncorrect() {
    this.set('showCorrectionForm', true);
  }

  @action
  cancelEntryCorrection() {
    this.set('showCorrectionForm', false);
  }

  @action
  saveEntryCorrection(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();

    this.set('isSubmitting', true);
    model.save().then(() => {
      this.set('showCorrectionForm', false);
      this.toast.success('Correction request was succesfully submitted.');
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }

  @action
  assetCheckInAction(ap) {
    this.ajax.request(`asset/${ap.asset.id}/checkin`, { method: 'POST'})
    .then((result) => {
      set(ap, 'checked_in', result.checked_in);
      this.toast.success('Asset has been successfully checked in.');
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  _updateOnSite(on_site) {
    this.person.set('on_site', on_site);
    this.person.save().then(() => {
      this.toast.success(`${this.person.callsign} has been successfully marked ${on_site ? 'ON' : 'OFF'} SITE.`);
    })
    .catch((response) => this.house.handleErrorResponse(response));
  }

  @action
  markOffSite() {
    if (this.assetsCheckedOut.length
      || this.unverifiedTimesheets.length
      || !this.isOffDuty) {

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
}
