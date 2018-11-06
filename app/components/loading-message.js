import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class LoadingMessageComponent extends Component {
  static positionalParams = [ 'message' ];

  @argument message;
}
