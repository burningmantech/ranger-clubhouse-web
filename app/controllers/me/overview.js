import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class MeOverviewController extends Controller {
  @action
  refreshPhoto() {
    this.ajax.request(`person/${this.person.id}/photo`)
         .then((result) => this.set('photo', result.photo));
    // Need to refresh the milestones to pick up the new photo submitted status.
    this.ajax.request(`person/${this.person.id}/milestones`).then((result) => this.set('milestones', result.milestones));
  }

  @action
  showUploadDialogAction() {
    this.set('showUploadDialog', true);
  }

  @action
  closeUploadDialogAction() {
    this.set('showUploadDialog', false);
  }
}
