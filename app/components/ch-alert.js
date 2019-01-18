import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class ChAlertComponent extends Component {
  static positionalParams = [ 'type' ];

  @argument('string') type='danger';
  @argument('boolean') bold = false;
}
