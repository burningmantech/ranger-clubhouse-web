import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MeHomepageController extends ClubhouseController {
  @tracked remainingOffPageMotds = 0;
  @tracked isLoadingMotds = false;

  @tracked photo;
  @tracked milestones;
  @tracked showUploadDialog = false;

  get isDevelopmentEnv() {
    return this.session.isStaging || this.session.isDevelopment;
  }

  @action
  refreshPhoto() {
    this.ajax.request(`person/${this.person.id}/photo`)
      .then(({photo}) => this.photo = photo);
    // Need to refresh the milestones to pick up the new photo submitted status.
    this.ajax.request(`person/${this.person.id}/milestones`).then(({milestones}) => this.milestones = milestones);
  }

  @action
  showUploadDialogAction(event) {
    if (event) {
      event.preventDefault();
    }
    this.showUploadDialog = true;
  }

  @action
  closeUploadDialogAction() {
    this.showUploadDialog = false;
  }

  @action
  debugUpdateAction() {
    this.milestones = {...this.milestones};
    this.photo = {...this.photo};

  }
}
