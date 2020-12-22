import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MeHomepageController extends Controller {
  @tracked remainingOffPageMotds = 0;
  @tracked isLoadingMotds = false;

  @tracked photo;
  @tracked milestones;
  @tracked showUploadDialog = false;
  @tracked showBehaviorAgreement = false;

  @action
  refreshPhoto() {
    this.ajax.request(`person/${this.person.id}/photo`)
      .then((result) => this.photo = result.photo);
    // Need to refresh the milestones to pick up the new photo submitted status.
    this.ajax.request(`person/${this.person.id}/milestones`).then((result) => this.milestones = result.milestones);
  }

  @action
  showUploadDialogAction(event) {
    if (event) {
      event.preventDefault();
    }
    this.showUploadDialog =  true;
  }

  @action
  closeUploadDialogAction() {
    this.showUploadDialog =  false;
  }

  @action
  showBehaviorAgreementAction(event) {
    if (event) {
      event.preventDefault();
    }
    this.showBehaviorAgreement = true;
  }

  @action
  closeAgreementAction() {
    if (this.showBehaviorAgreement) {
      this.showBehaviorAgreement = false;
    }
  }

  @action
  signAgreementAction() {
    const person = this.person;

    person.set('behavioral_agreement', true);
    person.save().then(() => {
      this.toast.success('Your agreement has been successfully recorded.');
      this.showBehaviorAgreement = false;
      this.milestones = { ...this.milestones, behavioral_agreement: true };
    }).catch((response) => this.house.handleErrorResponse(response));
  }


  @action
  debugUpdateAction() {
    this.milestones = {...this.milestones};
    this.photo =  {...this.photo};

  }

  get isDevelopmentEnv() {
    return this.session.isStaging || this.session.isDevelopment;
  }
}
