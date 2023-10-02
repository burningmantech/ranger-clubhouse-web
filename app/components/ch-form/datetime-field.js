import ChFormFieldBaseComponent from './field-base';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later} from '@ember/runloop';

export default class ChFormDatetimeFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-control';
  @tracked enableTime = true;

  constructor() {
    super(...arguments);

    if (this.args.dateOnly) {
      this.enableTime = false;
    }
  }

  @action
  invalidInput() {
    later(() => {
      // Delay errors reporting because ember-changeset will clear any errors after field blur.
      this.args.form.model.addError(this.args.name, this.args.dateOnly ? 'Invalid date' : 'Invalid date/time');
    }, 10);
  }
}
