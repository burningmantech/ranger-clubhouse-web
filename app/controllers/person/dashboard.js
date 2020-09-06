import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PersonDashboardController extends Controller {
  @action
  noButtonAction() {
    this.modal.info('Button Disabled', 'The button can only be used by the logged in user.');
  }
}
