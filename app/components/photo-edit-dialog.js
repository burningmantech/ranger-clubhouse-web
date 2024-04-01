import Component from '@glimmer/component';
import {action} from '@ember/object';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class PhotoEditDialogComponent extends Component {
  @service ajax;
  @service house;
  @service toast;

  width = 350;
  height = 450;

  @tracked isSubmitting;

  /**
   * Submit the edited photo.
   *
   * @param blob
   */

  @action
  async submitEditedPhotoAction(blob) {
    const {photo} = this.args;
    const formData = new FormData();

    formData.append('image', blob, photo.image_filename);

    // Let the backend know the user might be uploading a new photo.
    try {
      this.isSubmitting = true;
      await this.ajax.post(`person-photo/${photo.id}/replace`, {
        data: formData,
        processData: false,
        contentType: false,
      });
      await photo.reload();
      this.toast.success('Edited photo successfully uploaded.');
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
      this.args?.onClose();
    }
  }
}
