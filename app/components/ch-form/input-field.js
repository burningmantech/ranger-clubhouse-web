import ChFormFieldBaseComponent from './field-base';
import {action} from '@ember/object';
import focusElement from "clubhouse/utils/focus-element";

/*
   Base class for text, number, and password fields.
 */

export default class ChFormInputFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';

  @action
  inputInserted(element) {
    // Delay focusing in case animation fade in/out effects are happening.
    if (this.args.autofocus) {
      focusElement(element);
    }
  }
}
