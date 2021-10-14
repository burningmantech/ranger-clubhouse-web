import ChFormFieldBaseComponent from './field-base';
import { tracked } from '@glimmer/tracking';

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
}
