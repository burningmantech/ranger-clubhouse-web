import ChFormInputFieldComponent from './input-field';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ChFormPasswordFieldComponent extends ChFormInputFieldComponent {
  type = 'password';

  @tracked showPassword = false;

  @action
  toggleShow() {
    this.showPassword = !this.showPassword;
    this.type = this.showPassword ? 'text' : 'password';
  }
}
