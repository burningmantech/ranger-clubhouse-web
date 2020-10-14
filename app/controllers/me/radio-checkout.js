import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MeRadioCheckoutController extends Controller {
  @tracked isSubmitting;
  @tracked hasAgreed;
  @tracked documentHasLoaded;

  @action
  agreeAction() {
    this.personEvent.asset_authorized = true;

    this.isSubmitting = true;
    this.personEvent.save().then(() => {
      this.hasAgreed = true;
      this.toast.success('Agreement has been successfully recorded.');
    }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  loadedAction() {
    this.documentHasLoaded = true;
  }

  get currentYear() {
    return this.house.currentYear();
  }
}
