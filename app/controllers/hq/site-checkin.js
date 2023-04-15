import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {NON_RANGER} from 'clubhouse/constants/person_status';
import {TRAINING} from 'clubhouse/constants/positions';

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

  get isPersonDirtTrained() {
    if (this.person.status === NON_RANGER) {
      return true;
    }

    const training = this.eventInfo.trainings.find((training) => training.position_id === TRAINING);
    return (training && training.status === 'pass');
  }

  @action
  saveContactForm(model) {
    this.isContactSaved = false;
    this._savePerson(model, 'Contact information successfully saved.', () => {
      this.isContactSaved = true;
    });
  }

  async _savePerson(model, message, callback) {
    this.isSubmitting = true;
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
}
