import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { classNames } from '@ember-decorators/component';

@classNames('mugshot', 'float-md-right')
export default class PersonPhotoComponent extends Component {
  @argument(optional('object')) photo;
}
