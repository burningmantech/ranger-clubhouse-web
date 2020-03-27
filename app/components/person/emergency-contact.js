import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import EmergencyContactValidations from 'clubhouse/validations/emergency-contact';

export default class PersonEmergencyContactComponent extends Component {
  @service house;
  @tracked isSaved = false;
  @tracked isSubmitting = false;

  emergencyContactValidations = EmergencyContactValidations;

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    this.isSubmitting = true;
    this.house.saveModel(model, 'Emergency contact info successfully updated.',
      () => this.isSaved = true
    )
      .finally(() => this.isSubmitting = false);
  }
}
