import Controller from '@ember/controller';
import EmberObject, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class VcPhotoReviewController extends Controller {
  @tracked reviewPhoto = null;
  @tracked reviewForm = null;
  @tracked isSubmitting = false;

  @tracked editPhoto = null;
  @tracked showPhoto = null;

  width = 350;
  height = 450;

  // Set in the route
  rejectionOptions = [];

  @action
  showReviewPhoto(photo) {
    this.reviewPhoto = photo;
    this.reviewForm = EmberObject.create({ reasons: [], message: '' });
  }

  @action
  onClose() {
    if (this.reviewPhoto) {
      this.reviewPhoto = null;
    }
  }

  @action
  approveAction(photo) {
    photo.status = 'approved';

    photo.save().catch((response) => {
      photo.rollbackAttributes();
      this.house.handleErrorResponse(response);
    });
  }

  @action
  onRejectSubmit(model) {
    const photo = this.reviewPhoto;

    if (model.reasons.length == 0) {
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

  @action
  editPhotoAction(photo) {
    this.editPhoto = photo;
  }

  @action
  closeEditPhotoAction() {
    if (this.editPhoto) {
      this.editPhoto = null;
    }
  }

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
      this.toast.success('Edited photo succesfully uploaded.');
      photo.reload()
        .finally(() => {
          this.editPhoto = null;
        });
    }).catch((response) => {
      this.house.handleErrorResponse(response);
    });
  }

  @action
  showPhotoInfoAction(photo) {
    this.showPhoto = photo;
  }

  @action
  closePhotoInfoAction() {
    this.showPhoto = null;
  }
}
