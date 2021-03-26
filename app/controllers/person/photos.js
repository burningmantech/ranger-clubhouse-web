import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';

export default class PersonPhotosController extends ClubhouseController {
  @action
  deletePhotoAction(photo) {
    this.modal.confirm('Confirm photo deletion', 'Are you really sure you want to delete the photo?', () => {
      photo.destroyRecord().then(() => {
        this.toast.success('The photo has been deleted');
      }).catch((response) => this.house.handleErrorResponse(response))
    });
  }

  @action
  activatePhotoAction(photo) {
    this.ajax.request(`person-photo/${photo.id}/activate`, {
      method: 'POST'
    }).then(() => {
      this.photos.update();
      this.toast.success('Photo has been activated');
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
