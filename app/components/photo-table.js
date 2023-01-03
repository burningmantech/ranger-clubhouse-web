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
  approveAction(photo) {
    photo.status = 'approved';

    photo.save().catch((response) => {
      photo.rollbackAttributes();
      this.house.handleErrorResponse(response);
    });
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
