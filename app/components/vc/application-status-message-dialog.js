import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import {StatusesThatSendEmail} from "clubhouse/models/prospective-application";

export default class VcApplicationStatusMessageDialogComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting;
  @tracked emailToPreview;

  messageForm;
  messageValidation;

  constructor() {
    super(...arguments);
    const message = this.args.message ?? '';
    this.messageForm = EmberObject.create({message});
    if (this.args.askForMessage) {
      this.messageValidation = {
        message: [validatePresence({presence: true, message: 'Please supply a reason / message.'})]
      };
    } else {
      this.messageValidation = null;
    }
  }

  get doesStatusSendEmail() {
    return StatusesThatSendEmail.includes(this.args.status);
  }

  @action
  async updateStatusWithMessage(model, isValid) {
    if (!isValid) {
      return;
    }

    await this._submitStatusUpdate(this.args.status, this.args.askForMessage ? model.message : null);
  }

  @action
  async previewEmailAction(model) {
    const data = {
      status: this.args.status,
    };

    if (this.args.askForMessage) {
      data.message = model.message;
    }

    this._previewEmail(data);
  }

  async _previewEmail(data) {
    this.isSubmitting = true;
    try {
      const {mail} = await this.ajax.request(`prospective-application/${this.args.application.id}/preview-email`, {data});
      this.emailToPreview = mail;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  closePreviewEmailDialog() {
    this.emailToPreview = null;
  }

  async _submitStatusUpdate(status, message = null) {
    try {
      const data = {status};
      if (message) {
        data.message = message;
      }
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${this.args.application.id}/status`, {data});
      await this.args.application.reload();
      this.toast.success('Status was successfully updated.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }
}
