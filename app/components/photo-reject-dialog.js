import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';

export default class PhotoRejectDialogComponent extends Component {
  @service toast;
  @service ajax;
  @service modal;
  @service house;

  @tracked reviewForm = {reasons: [], message: ''};
  @tracked rejectMail = null;
  @tracked rejectionOptions = [];

  @tracked isSubmitting = false;

  constructor() {
    super(...arguments);
    this.rejectionOptions = this.args.reviewConfig.rejections.map((r) => [r.label, r.key]);
  }

  /**
   * Reject a photo.
   *
   * @param model
   */

  @action
  async onRejectSubmit(model) {
    const {photo} = this.args;

    if (!model.reasons.length) {
      this.modal.info(null, 'Please mark one or more reasons why the photo is being rejected.');
      return;
    }

    this.isSubmitting = true;

    photo.status = 'rejected';
    photo.reject_reasons = model.reasons;
    photo.reject_message = model.message;

    try {
      await photo.save();
      this.args.onClose();
    } catch (response) {
      photo.rollbackAttributes();
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Preview the rejection email
   */

  @action
  async rejectPreviewAction() {
    const form = this.reviewForm;
    const data = {
      reject_reasons: form.reasons,
      reject_message: form.message,
    };

    this.isSubmitting = true;
    try {
      const {mail} = await this.ajax.request(`person-photo/${this.args.photo.id}/reject-preview`, {data});
      this.rejectMail = mail;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Close the rejection preview dialog
   */

  @action
  closeRejectMail() {
    this.rejectMail = null;
  }

  /**
   * Load up the newly inserted iframe with the rejection email
   *
   * @param {HTMLElement} element
   */

  @action
  insertRejectMail(element) {
    const iframe = element.contentWindow.document;

    iframe.open();
    iframe.write(this.rejectMail);
    iframe.close();
  }
}
