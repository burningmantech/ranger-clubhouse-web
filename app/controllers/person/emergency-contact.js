import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class PersonEmergencyContactController extends Controller {

  @action
  cancelAction() {
    this.toast.warning('Edit has been cancelled. No changes were saved.');
    this.transitionToRoute('person.index');
  }
}
