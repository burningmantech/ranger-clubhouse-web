import ChFormFieldBaseComponent from './field-base';
import { tracked } from '@glimmer/tracking';

export default class ChFormDatetimeFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';
  @tracked enableTime = true;

  constructor() {
    super(...arguments);

    if (this.args.dateOnly) {
      this.enableTime = false;
    }
  }
}
