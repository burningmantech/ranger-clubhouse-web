import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { action, computed } from '@ember/object';

export default class ChFormSubmitComponent extends Component {
  tagName = '';

  label = null;
  submitClass = null;
  disabled = null;
  formSubmitAction = null; // Form submit action
  onSubmit = null; // Form submit action

  @action
  submitAction() {
    this.formSubmitAction(this.onSubmit);
  }

  @computed('label')
  get _label() {
    return isEmpty(this.label) ? 'Save' : this.label;
  }
}
