import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {STATUS_HOLD_MORE_HANDLES} from "clubhouse/models/prospective-application";

export default class VcApplicationMoreHandlesDialogComponent extends Component {
  @service ajax;
  @service errors;
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
    } catch (response) {
      this.errors.handleErrorResponse(response);
      this.isSubmitting = false;
      return;
    }

    // The status POST is non-idempotent (records a rejection and emails the
    // applicant). Now that it has succeeded, reload the record then close the
    // dialog unconditionally so a failed reload cannot leave the form open and
    // invite a duplicate request.
    try {
      await application.reload();
    } catch (response) {
      this.errors.handleErrorResponse(response);
    }
    this.isSubmitting = false;
    this.toast.success('More Handles request successfully submitted.');
    this.args.onClose();
  }
}
