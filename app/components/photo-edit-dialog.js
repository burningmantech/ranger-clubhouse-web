import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';

export default class PhotoEditDialogComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  width = 350;
  height = 450;

  /**
   * Submit the edited photo.
   *
   * @param blob
   */

  @action
  submitEditedPhotoAction(blob) {
    const {photo} = this.args;
    const formData = new FormData();

    formData.append('image', blob, photo.image_filename);

    // Let the backend know the user might be uploading a new photo.
    this.ajax.post(`person-photo/${photo.id}/replace`, {
      data: formData,
      processData: false,
      contentType: false,
    }).then(() => {
      this.toast.success('Edited photo successfully uploaded.');
      photo.reload().finally(() => this.args.onClose());
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
