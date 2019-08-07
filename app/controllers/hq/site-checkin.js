import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import * as Position from 'clubhouse/constants/positions';

export default class HqSiteCheckinController extends Controller {
  @computed('assets.@each.checked_in')
  get activeAssets() {
    return this.assets.filter((asset) => !asset.checked_in);
  }

  @computed('eventInfo.trainings')
  get dirtTraining() {
    return this.eventInfo.trainings.find((training) => training.position_id == Position.DIRT);
  }

  @computed('eventInfo.training.@each.position_id')
  get isPersonDirtTrained() {
    if (this.person.status == 'non ranger') {
      return true;
    }

    const training = this.dirtTraining;

    return (training && training.status == 'pass');
  }

  @action
  saveContactForm(model) {
    this.set('contactSaved', false);
    this._savePerson(model, 'Contact information successfully saved.',() => {
      this.set('contactSaved', true);
    });
  }

  @action
  markAssetAuthorized() {
    this.person.set('asset_authorized', true);
    this._savePerson(this.person, 'Person marked as signing the radio checkout form.');
  }

  @action
  markOnSite() {
    this.person.set('on_site', true);
    this._savePerson(this.person,  'Person has been successfully marked as ON SITE.');
  }

  _savePerson(model, message, callback) {
    this.set('isSubmitting', true);
    this.toast.clear();
    model.save().then(() => {
      this.toast.success(message);
      if (callback) {
        callback();
      }
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }
}
