import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class HomeNeedsPhotoComponent extends Component {
  @argument('object') photo;
}
