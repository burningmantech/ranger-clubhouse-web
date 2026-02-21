import Component from '@glimmer/component';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';

export default class VcApplicationSendEmailDialogComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  @tracked isSubmitting;
  @tracked emailToPreview;

  emailForm;

  emailValidation = {
    subject: [validatePresence({presence: true, message: "Please supply a subject."})],
    message: [validatePresence({presence: true, message: "Please supply a message to the applicant."})],
  };

  constructor() {
    super(...arguments);
    const {application} = this.args;
    this.emailForm = EmberObject.create({
      subject: `Hey ${application.first_name}, we have a question about your Ranger application`,
      message: `Hey ${application.first_name} ${application.last_name},\n\n*insert your message here*\n\nYour Friendly Black Rock Ranger Volunteer Coordinators\n`
    });
  }

  @action
  async sendEmail(model, isValid) {
    if (!isValid) {
      return;
    }

    try {
      this.isSubmitting = true;
      await this.ajax.post(`prospective-application/${this.args.application.id}/send-email`, {
        data: {subject: model.subject, message: model.message}
      });
      await this.args.application.reload();
      this.toast.success('Email was sent.');
      this.args.onClose();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  previewRawEmail(model) {
    this.previewEmail({
      subject: model.subject,
      message: model.message,
      is_raw_email: 1
    });
  }

  @action
  async previewEmail(data) {
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

}
