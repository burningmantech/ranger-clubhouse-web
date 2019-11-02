import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';



@tagName('')
export default class PresentOrNotComponent extends Component {
  static positionalParams = [ 'value', 'empty' ];
  value = '';
  empty = 'not given';
}
