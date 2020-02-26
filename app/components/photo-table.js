import Component from '@glimmer/component';
import {tracked} from "@glimmer/tracking";
import { action } from '@ember/object';

export default class PhotoTableComponent extends Component {
  @tracked showPhoto = null;

  @action
  showPhotoAction(photo, event) {
    event.preventDefault();

    this.showPhoto = photo;
  }

  @action
  closePhotoAction() {
    this.showPhoto = null;
  }
}
