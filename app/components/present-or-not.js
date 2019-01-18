import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

@tagName('')
export default class PresentOrNotComponent extends Component {
  static positionalParams = [ 'value', 'empty' ];
  @argument(optional('any')) value = '';
  @argument(optional('any')) empty = 'not given';
}
