import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class ChFormResetButtonComponent extends Component {
  @argument resetAction;
  @argument label;
  @argument disabled;

  constructor() {
    super(...arguments);

    this.label = this.label || 'Reset';
  }
}
