import Controller from '@ember/controller';
import {action} from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class VcPhotosController extends Controller {
  @tracked photo;
  @tracked page;

  @action
  showPhotoAction(photo) {
    this.showPhoto = photo;
  }

  @action
  closePhotoAction() {
    this.showPhoto = null;
  }

  @action
  goNextPage() {
    this.page = +this.currentPage + 1;
  }

  @action
  goPrevPage() {
    this.page = +this.currentPage - 1;
  }
}
