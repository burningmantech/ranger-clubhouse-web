import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';

export default class ChFormSubmitComponent extends Component {
  @action
  submitAction(event) {
    event?.preventDefault();
    this.args.formSubmitAction(this.args.onSubmit);
  }

  get _label() {
    return isEmpty(this.args.label) ? 'Save' : this.args.label;
  }
}
