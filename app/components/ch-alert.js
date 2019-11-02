import Component from '@ember/component';

import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ChAlertComponent extends Component {
  static positionalParams = [ 'type' ];

  type='danger';
  bold = false;
}
