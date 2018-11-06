import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import EmergencyContactValidations from 'clubhouse/validations/emergency-contact';

export default class MeEmergencyContactController extends Controller {
  emergencyContactValidations = EmergencyContactValidations;

  @action
  submit(model, isValid) {
    if (!isValid) {
      return;
    }
    this.house.saveModel(model, 'Emergency contact info updated.');
  }

  @action
  cancel() {
    this.toast.warning('You have cancelled editing your emergency contact info. No changes were saved.');
    this.transitionToRoute('me.overview');
  }
}
