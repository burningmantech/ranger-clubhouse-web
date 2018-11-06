import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class ChFormSubmitComponent extends Component {
  @argument label;
  @argument submitClass;
  @argument disabled;
  @argument submitAction;

  constructor() {
    super(...arguments);

    if (this.label == null) {
      this.label = 'Save';
    }
  }
}
