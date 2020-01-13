import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PersonPhotoComponent extends Component {
  @service ajax;
  @service session;

  get canShowUploadUrl() {
    return (this.args.person.id == this.session.userId || this.session.user.isAdmin);
  }

  @action
  uploadAction() {
    // Let the backend know the user might be uploading a new photo.
    this.ajax.request(`person/${this.args.person.id}/photo-clear`, { method: 'POST' })
    .catch(() => true)
    .finally(() => {
      window.location.href = this.args.photo.upload_url;
    });
  }
}
