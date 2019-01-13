import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { classNames } from '@ember-decorators/component';

@classNames('mugshot', 'float-sm-right')
export default class PersonPhotoComponent extends Component {
  @argument photo;
}
