import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class ChFormSubmitComponent extends Component {
  @argument label;
  @argument submitClass;
  @argument disabled;
  @argument formSubmitAction; // Form submit action
  @argument onSubmit; // Form submit action

  constructor() {
    super(...arguments);

    if (this.label == null) {
      this.label = 'Save';
    }
  }

  @action
  submitAction() {
    this.formSubmitAction(this.onSubmit);
  }
}
