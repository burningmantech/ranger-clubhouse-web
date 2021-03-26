import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class PersonDashboardController extends ClubhouseController {
  @action
  noButtonAction() {
    this.modal.info('Button Disabled', 'The button can only be used by the logged in user.');
  }
}
