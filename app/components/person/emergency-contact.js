import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PersonEmergencyContactComponent extends Component {
  @service house;
  @tracked isSaved = false;

  @action
  saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    this.house.saveModel(model, 'Emergency contact info successfully updated.',
      () => this.isSaved = true
    )
  }
}
