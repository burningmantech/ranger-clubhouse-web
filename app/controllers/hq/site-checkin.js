import Controller from '@ember/controller';
import { action } from '@ember/object';
import { TRAINING } from 'clubhouse/constants/positions';
import { tracked } from '@glimmer/tracking';
import { NON_RANGER } from 'clubhouse/constants/person_status';

export default class HqSiteCheckinController extends Controller {
  @tracked isSubmitting = false;
  @tracked isContactSaved = false;
  @tracked isOnSite = false;
  @tracked showAlphaWarning = false;

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
    this._savePerson(model, 'Contact information successfully saved.',() => {
      this.isContactSaved = true;
    });
  }

  @action
  markOnSite() {
    this.person.on_site = true;
    this._savePerson(this.person,  'Person has been successfully marked as ON SITE.', () => {
      this.isOnSite = true;
    });
  }

  _savePerson(model, message, callback) {
    this.isSubmitting = true;
    model.save().then(() => {
      this.toast.success(message);
      if (callback) {
        callback();
      }
    }).catch((response) => {
        this.house.handleErrorResponse(response);
        model.rollbackAttributes();
    })
    .finally(() => this.isSubmitting = false);
  }

  @action
  closeAlphaWarning() {
    this.showAlphaWarning = false;
  }
}
