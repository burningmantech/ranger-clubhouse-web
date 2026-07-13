import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class VcApplicationEditHandlesDialogComponent extends Component {
  @service saveModel;

  @tracked isSubmitting;

  handlesForm;

  handlesValidation = {
    handles: [validatePresence({presence: true, message: 'Please enter a list of handles.'})]
  };

  constructor() {
    super(...arguments);
    this.handlesForm = EmberObject.create({handles: this.args.application.handles});
  }

  @action
  async submitHandlesList(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;
    application.handles = model.handles;
    if (await this.saveModel.save({model: application, message: 'The handles list was successfully updated.', owner: this})) {
      this.args.onClose();
    }
  }
}
