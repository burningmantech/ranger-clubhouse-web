import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class VcApplicationExtractedHandlesDialogComponent extends Component {
  @service saveModel;

  @tracked isSubmitting;

  handlesValidation = {
    handles: [validatePresence({presence: true, message: 'Please enter a list of handles.'})]
  };

  @action
  async saveExtractedHandles(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;
    application.handles = model.handles;
    if (await this.saveModel.save({model: application, message: 'The handles has been saved successfully.', owner: this})) {
      this.args.onClose();
    }
  }
}
