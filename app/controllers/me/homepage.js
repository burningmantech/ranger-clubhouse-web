import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import fade from 'ember-animated/transitions/fade';

export default class MeHomepageController extends Controller {
  @tracked remainingOffPageMotds = 0;
  @tracked isLoadingMotds = false;

  fadeMotdEffect = fade;

  @action
  refreshPhoto() {
    this.ajax.request(`person/${this.person.id}/photo`)
      .then((result) => this.set('photo', result.photo));
    // Need to refresh the milestones to pick up the new photo submitted status.
    this.ajax.request(`person/${this.person.id}/milestones`).then((result) => this.set('milestones', result.milestones));
  }

  @action
  showUploadDialogAction(event) {
    if (event) {
      event.preventDefault();
    }
    this.set('showUploadDialog', true);
  }

  @action
  closeUploadDialogAction() {
    this.set('showUploadDialog', false);
  }

  @action
  showBehaviorAgreementAction(event) {
    if (event) {
      event.preventDefault();
    }
    this.set('showBehaviorAgreement', true);
  }

  @action
  closeAgreementAction() {
    if (this.showBehaviorAgreement) {
      this.set('showBehaviorAgreement', false);
    }
  }

  @action
  signAgreementAction() {
    const person = this.person;

    person.set('behavioral_agreement', true);
    person.save().then(() => {
      this.toast.success('Your agreement has been successfully recorded.');
      this.set('showBehaviorAgreement', false);
      this.set('milestones', { ...this.milestones, behavioral_agreement: true });
    }).catch((response) => this.house.handleErrorResponse(response));
  }


  @action
  debugUpdateAction() {
    this.set('milestones', {...this.milestones});
    this.set('photo', {...this.photo});

  }

  get isDevelopmentEnv() {
    return this.session.isStaging || this.session.isDevelopment;
  }
}
