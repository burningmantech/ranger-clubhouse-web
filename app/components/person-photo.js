import Component from '@ember/component';
import { action } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { classNames } from '@ember-decorators/component';

@classNames('mugshot', 'float-md-right')
export default class PersonPhotoComponent extends Component {
  @argument('object') person;
  @argument(optional('object')) photo;
  @argument(optional('object')) syncAction;

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
