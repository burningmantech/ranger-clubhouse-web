import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class VcApplicationExtractedHandlesDialogComponent extends Component {
  @service house;
  @service toast;

  @tracked isSubmitting;

  handlesValidation = {
    handles: [validatePresence({presence: true, message: 'Please enter a list of handles.'})]
  };

  @action
  async saveExtractedHandles(model) {
    try {
      this.isSubmitting = true;
      const {application} = this.args;
      application.handles = model.handles;
      await application.save();
      this.toast.success('The handles has been saved successfully.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
