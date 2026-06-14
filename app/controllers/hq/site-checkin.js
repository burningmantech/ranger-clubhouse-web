import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

// User-facing copy kept out of control flow.
const NO_RADIO_CHECKED_OUT_TITLE = 'No Event Radios Checked Out';
const NO_RADIO_CHECKED_OUT_BODY = (callsign) =>
  `${callsign} is allowed an Event Radio, however, no radios were checked out. ` +
  `Use the Confirm button to indicate the person is not receiving a radio at this time. ` +
  `Otherwise, use Cancel and ensure the radio is checked out.`;

export default class HqSiteCheckinController extends ClubhouseController {
  @service saveModel;

  @tracked isSubmitting = false;
  @tracked isOnSite = false;
  @tracked showSiteCheckInWizard = false;
  @tracked siteCheckInStarted = false;
  @tracked siteCheckInFinished = false;

  /**
   * Single per-entry reset; called from the route's setupController so the field
   * names live once, next to their @tracked declarations. Resets the full set
   * (including isSubmitting) so nothing leaks across person navigation.
   *
   * @param {Model} person the person record being checked in
   */
  resetState(person) {
    this.isSubmitting = false;
    this.isOnSite = person?.on_site ?? false;
    this.showSiteCheckInWizard = false;
    this.siteCheckInStarted = false;
    this.siteCheckInFinished = false;
  }

  get activeAssets() {
    return (this.assets ?? []).filter((asset) => !asset.checked_in);
  }

  // Single source of truth for radio eligibility, null-safe. Consumed by the
  // template and checkForRadio alike.
  get allowedEventRadio() {
    return Boolean(
      this.eventInfo?.radio_eligible &&
      this.personEvent?.asset_authorized &&
      (this.eventInfo?.radio_max ?? 0) > 0
    );
  }

  get isAlphaOrProspective() {
    return Boolean(this.person?.isAlpha || this.person?.isProspective);
  }

  @action
  async saveContactForm(model, callback) {
    const ok = await this.saveModel
      .save({model, message: 'Emergency Contact info successfully saved.', owner: this});
    if (ok) {
      callback?.();
    }
  }

  @action
  startSiteCheckIn() {
    if (this.isSubmitting || this.isOnSite) {
      return;
    }
    this.showSiteCheckInWizard = true;
    this.siteCheckInStarted = true;
  }

  @action
  cancelSiteCheckIn() {
    this.showSiteCheckInWizard = false;
  }

  @action
  async finishSiteCheckIn() {
    if (this.isSubmitting) {
      return;
    }
    const {person} = this;
    person.on_site = true;
    const ok = await this.saveModel.save({
      model: person,
      message: 'Person has been successfully marked as ON SITE.',
      owner: this,
    });
    if (ok) {
      this.isOnSite = true;
      this.showSiteCheckInWizard = false;
      this.siteCheckInFinished = true;
      this.siteCheckInStarted = false;
    }
  }

  @action
  checkForRadio(callback) {
    if (this.allowedEventRadio && !this.activeAssets.length) {
      this.modal.confirm(
        NO_RADIO_CHECKED_OUT_TITLE,
        NO_RADIO_CHECKED_OUT_BODY(this.person.callsign),
        () => callback()
      );
    } else {
      callback();
    }
  }
}
