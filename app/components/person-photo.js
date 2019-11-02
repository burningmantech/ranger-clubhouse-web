import Component from '@ember/component';
import { action, computed } from '@ember/object';


import { classNames } from '@ember-decorators/component';

@classNames('mugshot', 'float-md-right')
export default class PersonPhotoComponent extends Component {
  person = null;
  photo = null;
  syncAction = null;

  @computed('person')
  get canShowUploadUrl() {
    return (this.person.id == this.session.userId || this.session.user.isAdmin);
  }

  @action
  uploadAction() {
    // Let the backend know the user might be uploading a new photo.
    this.ajax.request(`person/${this.person.id}/photo-clear`, { method: 'POST' })
    .catch(() => true)
    .finally(() => {
      window.location.href = this.photo.upload_url;
    });
  }
}
