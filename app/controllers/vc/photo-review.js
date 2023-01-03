import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class VcPhotoReviewController extends ClubhouseController {
  @tracked reviewPhoto = null;
  @tracked isSubmitting = false;

  @tracked editPhoto = null;
  @tracked showPhoto = null;

  /**
   * Show a photo to review
   *
   * @param photo
   */

  @action
  showReviewPhoto(photo) {
    this.reviewPhoto = photo;
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
   * Setup to edit a photo
   *
   * @param photo
   */

  @action
  editPhotoAction(photo) {
    this.editPhoto = photo;
  }

  /**
   * Close up the photo editing dialog
   */

  @action
  closeEditPhotoAction() {
    if (this.editPhoto) {
      this.editPhoto = null;
    }
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
