import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PersonPhotoComponent extends Component {
  @service session;

  get canShowUploadButton() {
    const { person, photo } = this.args;
    const session = this.session;

    return (
      (photo.upload_enabled && +person.id === session.userId)
      || session.isAdmin
      || session.isVC
    );
  }
}
