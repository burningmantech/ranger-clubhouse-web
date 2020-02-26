import Controller from '@ember/controller';
import {action} from '@ember/object';

export default class VcPhotosController extends Controller {
  @action
  showPhotoAction(photo) {
    this.set('showPhoto', photo);
  }

  @action
  closePhotoAction() {
    this.set('showPhoto', null);
  }

  @action
  goNextPage() {
    this.set('page', +this.currentPage + 1);
  }

  @action
  goPrevPage() {
    this.set('page', +this.currentPage - 1);
  }
}
