import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class PresentOrNotComponent extends Component {
  static positionalParams = [ 'value', 'empty' ];
  @argument value = '';
  @argument empty = 'not given';
}
