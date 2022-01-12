import ChFormFieldBaseComponent from './field-base';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { schedule } from '@ember/runloop';

export default class ChFormTextareaFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';

  /**
   * The initial textarea's value. Don't provide the current value to avoid unwanted re-renders.
   *
   * @type {string}
   * @private
   */

  @tracked _val = '';

  constructor() {
    super(...arguments);
    this._val = this.args.value ?? this.modelValue;
  }

  @action
  fieldInserted(element) {
    if (this.args.autofocus) {
      schedule('afterRender', () => element.focus());
    }
  }
}
