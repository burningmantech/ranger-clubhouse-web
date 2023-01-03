import ChFormFieldBaseComponent from './field-base';
import {action} from '@ember/object';
import {schedule} from '@ember/runloop';

export default class ChFormTextareaFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';

  @action
  fieldInserted(element) {
    if (this.args.autofocus) {
      schedule('afterRender', () => element.focus());
    }
  }
}
