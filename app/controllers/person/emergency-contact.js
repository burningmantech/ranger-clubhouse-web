import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class PersonEmergencyContactController extends ClubhouseController {

  @action
  cancelAction() {
    this.toast.warning('Edit has been cancelled. No changes were saved.');
    this.router.transitionTo('person.index');
  }
}
