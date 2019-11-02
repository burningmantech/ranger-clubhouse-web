import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { tagName } from '@ember-decorators/component';



@tagName('')
export default class ChFormSubmitComponent extends Component {
  label = null;
  submitClass = null;
  disabled = null;
  formSubmitAction = null; // Form submit action
  onSubmit = null; // Form submit action

 init() {
    super.init(...arguments);

    if (isEmpty(this.label)) {
      this.label = 'Save';
    }
  }

  @action
  submitAction() {
    this.formSubmitAction(this.onSubmit);
  }
}
