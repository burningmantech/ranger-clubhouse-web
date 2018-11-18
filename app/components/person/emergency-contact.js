import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import EmergencyContactValidations from 'clubhouse/validations/emergency-contact';

export default class PersonEmergencyContactComponent extends Component {
  @argument person;
  @argument onCancel;

  emergencyContactValidations = EmergencyContactValidations;

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    this.house.saveModel(model, 'Emergency contact info has been succesfully updated.');
  }
}
