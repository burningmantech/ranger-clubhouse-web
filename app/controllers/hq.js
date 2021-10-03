import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class HqController extends ClubhouseController {
  @tracked person;
  @tracked photo;
  @tracked timesheetSummary;

  @tracked userIsMentor = false;

  @tracked showAlphaWarning = false;
  @tracked showSignInWarning = false;
  @tracked showTicketsAndProvisions = false;
  @tracked showNotAllowedToWork = false;

  @action
  closeAlphaWarning() {
    this.showAlphaWarning = false;
  }

  @action
  closeSignInWarning() {
    this.showSignInWarning = false;
  }

  @action
  closeNotAllowedToWork() {
    this.showNotAllowedToWork = false;
  }

  /**
   * Toggle the hours & credits breakdown dialog
   */

  @action
  toggleTicketsAndProvisionsProgress() {
    this.showTicketsAndProvisions = !this.showTicketsAndProvisions;
  }
}
