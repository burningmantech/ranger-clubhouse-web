import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PersonPhotoComponent extends Component {
  @service session;

  get canShowUploadButton() {
    const { person, photo } = this.args;
    const user = this.session.user;

    return ((photo.upload_enabled && person.id == user.id) ||
      user.isAdmin || user.isVC);
  }
}
