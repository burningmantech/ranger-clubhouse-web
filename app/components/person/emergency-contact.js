import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class PersonEmergencyContactComponent extends Component {
  @service saveModel;
  @tracked isSaved = false;

  @action
  async saveAction(model, isValid) {
    if (!isValid) {
      return;
    }
    if (await this.saveModel.save({model, message: 'Emergency contact info successfully updated.'})) {
      this.isSaved = true;
    }
  }
}
