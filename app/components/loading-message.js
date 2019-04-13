import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class LoadingMessageComponent extends Component {
  static positionalParams = [ 'message' ];

  @argument('string') message;
}
