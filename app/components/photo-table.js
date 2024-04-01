import Component from '@glimmer/component';
import {tracked} from "@glimmer/tracking";
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class PhotoTableComponent extends Component {
  @service ajax;
  @service house;

  @tracked showPhoto = null;
  @tracked rejectPhoto = null;

  @tracked editPhoto = null;

  @tracked isSubmitting = false;

  @action
  showPhotoAction(photo, event) {
    event.preventDefault();

    this.showPhoto = photo;
  }

  @action
  closePhotoAction() {
    this.showPhoto = null;
  }

  @action
  showRejectDialog(photo) {
    this.rejectPhoto = photo;
  }

  @action
  onRejectClose() {
    this.rejectPhoto = null;
  }

  /**
   * Approve a photo.
   *
   * @param photo
   */

  @action
  async approveAction(photo) {
    photo.status = 'approved';

    try {
      this.isSubmitting = true;
      await photo.save();
    } catch (response) {
      photo.rollbackAttributes();
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  editPhotoAction(photo) {
    this.editPhoto = photo;
  }

  @action
  closeEditPhotoAction() {
    this.editPhoto = null;
  }
}
