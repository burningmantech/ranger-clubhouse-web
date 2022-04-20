import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import EmberObject, {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class VcPhotoReviewController extends ClubhouseController {
  @tracked reviewPhoto = null;
  @tracked reviewForm = null;
  @tracked isSubmitting = false;

  @tracked editPhoto = null;
  @tracked showPhoto = null;

  @tracked rejectMail = null;

  width = 350;
  height = 450;

  // Set in the route
  @tracked rejectionOptions = [];

  /**
   * Show a photo to review
   *
   * @param photo
   */

  @action
  showReviewPhoto(photo) {
    this.reviewPhoto = photo;
    this.reviewForm = EmberObject.create({reasons: [], message: ''});
  }

  /**
   * Close up the photo being reviewed.
   */

  @action
  onClose() {
    if (this.reviewPhoto) {
      this.reviewPhoto = null;
    }
  }

  /**
   * Approve a photo.
   *
   * @param photo
   */

  @action
  approveAction(photo) {
    photo.status = 'approved';

    photo.save().catch((response) => {
      photo.rollbackAttributes();
      this.house.handleErrorResponse(response);
    });
  }

  /**
   * Reject a photo.
   *
   * @param model
   */

  @action
  onRejectSubmit(model) {
    const photo = this.reviewPhoto;

    if (!model.reasons.length) {
      this.modal.info(null, 'Please mark one or more reasons why the photo is being rejected.');
      return;
    }

    this.isSubmitting = true;

    photo.status = 'rejected';
    photo.reject_reasons = model.reasons;
    photo.reject_message = model.message;

    photo.save().then(() => {
      this.reviewPhoto = null;
    }).catch((response) => {
      photo.rollbackAttributes();
      this.house.handleErrorResponse(response);
    }).finally(() => {
      this.isSubmitting = false;
    });
  }

  /**
   * Preview the rejection email
   */

  @action
  rejectPreviewAction() {
    const form = this.reviewForm;
    const data = {
      reject_reasons: form.reasons,
      reject_message: form.message
    };

    this.ajax.request(`person-photo/${this.reviewPhoto.id}/reject-preview`, {method: 'GET', data})
      .then((result) => this.rejectMail = result.mail)
      .catch((response) => this.house.handleErrorResponse(response));
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

  /**
   * Setup to edit a photo
   *
   * @param photo
   */

  @action
  editPhotoAction(photo) {
    this.editPhoto = photo;
  }

  /**
   * Close up the photo editting dialog
   */

  @action
  closeEditPhotoAction() {
    if (this.editPhoto) {
      this.editPhoto = null;
    }
  }

  /**
   * Submit the edited photo.
   *
   * @param blob
   */

  @action
  submitEditedPhotoAction(blob) {
    const photo = this.editPhoto;
    const formData = new FormData();

    formData.append('image', blob, photo.image_filename);

    // Let the backend know the user might be uploading a new photo.
    this.ajax.post(`person-photo/${photo.id}/replace`, {
      data: formData,
      processData: false,
      contentType: false,
    }).then(() => {
      this.toast.success('Edited photo successfully uploaded.');
      photo.reload()
        .finally(() => {
          this.editPhoto = null;
        });
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    });
  }

  /**
   * Show the photo meta data. (size, created at, edited at, etc.)
   *
   * @param photo
   */

  @action
  showPhotoInfoAction(photo) {
    this.showPhoto = photo;
  }

  /**
   * Close up the photo info dialog
   */

  @action
  closePhotoInfoAction() {
    this.showPhoto = null;
  }
}
