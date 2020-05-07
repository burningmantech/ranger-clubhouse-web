import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import * as Position from 'clubhouse/constants/positions';
import { tracked } from '@glimmer/tracking';

export default class HqSiteCheckinController extends Controller {
  @tracked isSubmitting = false;
  @tracked isContactSaved = false;
  @tracked isOnSite = false;

  @computed('assets.@each.checked_in')
  get activeAssets() {
    return this.assets.filter((asset) => !asset.checked_in);
  }

  @computed('eventInfo.trainings')
  get dirtTraining() {
    return this.eventInfo.trainings.find((training) => training.position_id == Position.TRAINING);
  }

  @computed('dirtTraining', 'eventInfo.training.@each.position_id', 'person.status')
  get isPersonDirtTrained() {
    if (this.person.status == 'non ranger') {
      return true;
    }

    const training = this.dirtTraining;

    return (training && training.status == 'pass');
  }

  @action
  saveContactForm(model) {
    this.isContactSaved = false;
    this._savePerson(model, 'Contact information successfully saved.',() => {
      this.isContactSaved = true;
    });
  }

  @action
  markAssetAuthorized() {
    this.person.asset_authorized = true;
    this._savePerson(this.person, 'Person marked as signing the radio checkout form.');
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
}
