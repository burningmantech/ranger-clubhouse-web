import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {STATUS_HOLD_MORE_HANDLES} from "clubhouse/models/prospective-application";

export default class VcApplicationMoreHandlesDialogComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting;

  handlesForm;

  moreHandlesValidation = {
    message: [validatePresence({presence: true, message: 'Please supply a reason / message.'})]
  };

  constructor() {
    super(...arguments);
    this.handlesForm = EmberObject.create({
      message: this.args.application.handles
    });
  }

  @action
  async submitMoreHandles(model, isValid) {
    if (!isValid) {
      return;
    }

    const {application} = this.args;
    try {
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${application.id}/status`, {
        data: {
          status: STATUS_HOLD_MORE_HANDLES,
          message: model.message
        }
      });
      await application.reload();
      this.toast.success('More Handles request successfully submitted.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
