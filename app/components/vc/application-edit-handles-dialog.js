import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class VcApplicationEditHandlesDialogComponent extends Component {
  @service house;
  @service toast;

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

    try {
      this.isSubmitting = true;
      application.handles = model.handles;
      await application.save();
      this.toast.success('The handles list was successfully updated.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
