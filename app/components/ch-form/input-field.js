import ChFormFieldBaseComponent from './field-base';
import { action }from '@ember/object';
import { schedule }from '@ember/runloop';

/*
   Base class for text, number, and password fields.
 */

export default class ChFormInputFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';

  @action
  inputInserted(element) {
    if (this.args.autofocus) {
      setTimeout(() => schedule('afterRender', () => element.focus()), 100);
    }
  }
}
