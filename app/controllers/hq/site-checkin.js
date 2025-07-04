import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class HqSiteCheckinController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked isContactSaved = false;
  @tracked isOnSite = false;
  @tracked showSiteCheckInWizard = false;
  @tracked siteCheckInStarted = false;
  @tracked siteCheckInFinished = false;

  get activeAssets() {
    return this.assets.filter((asset) => !asset.checked_in);
  }

  @action
  saveContactForm(model, callback) {
    this.isContactSaved = false;
    this._savePerson(model, 'Emergency Contact info successfully saved.', () => {
      this.isContactSaved = true;
      callback();
    });
  }

  async _savePerson(model, message, callback) {
    this.isSubmitting = true;
    this.toast.clear();
    try {
      await model.save();
      this.toast.success(message);
      callback?.();
    } catch (response) {
      this.house.handleErrorResponse(response);
      model.rollbackAttributes();
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  startSiteCheckIn() {
    this.showSiteCheckInWizard = true;
    this.siteCheckInStarted = true;
  }

  @action
  cancelSiteCheckIn() {
    this.showSiteCheckInWizard = false;
  }

  @action
  finishSiteCheckIn() {
    this.person.on_site = true;
    this._savePerson(this.person, 'Person has been successfully marked as ON SITE.', () => {
      this.isOnSite = true;
      this.showSiteCheckInWizard = false;
      this.siteCheckInFinished = true;
      this.siteCheckInStarted = false;
    });
  }

  get allowedEventRadio() {
    return (this.eventInfo.radio_eligible && this.personEvent.asset_authorized && this.eventInfo.radio_max > 0)
  }

  @action
  checkForRadio(callback) {
    if (this.allowedEventRadio && !this.activeAssets.length) {
      this.modal.confirm('No Event Radios Checked Out',
        `${this.person.callsign} is allowed an Event Radio, however, no radios where checked out. Use the Confirm button to indicate the person is not receiving a radio at this time. Otherwise, use Cancel and ensure the radio is checked out.`,
        () => callback());
    } else {
      callback();
    }
  }
}
