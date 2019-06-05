import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class MeNeedsPhotoComponent extends Component {
  @argument('object') person;
  @argument('object') photo;
}
