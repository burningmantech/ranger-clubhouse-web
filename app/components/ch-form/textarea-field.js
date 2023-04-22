import ChFormFieldBaseComponent from './field-base';
import {action} from '@ember/object';
import focusElement from "clubhouse/utils/focus-element";
export default class ChFormTextareaFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';

  @action
  fieldInserted(element) {
    if (this.args.autofocus) {
      focusElement(element);
    }
  }
}
