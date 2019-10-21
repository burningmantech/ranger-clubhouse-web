import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class LoadingDialogComponent extends Component {
  static positionalParams = [ 'item' ];

  item = 'the information';
  customMessage = null;
}
