import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import PasswordValidations from 'clubhouse/validations/password';

export default class MePasswordController extends Controller {
  passwordValidations = PasswordValidations;
  @tracked isSubmitting = false;

  @action
  submitAction(model, isValid) { // eslint-disable-line no-unused-vars
    if (!isValid) {
      return;
    }

    const person = this.person;
    const passwords = {
      password_old: model.password_old,
      password: model.password,
      password_confirmation: model.password_confirmation
    };

    this.isSubmitting = true;
    return this.ajax.request(`person/${person.id}/password`, { method: 'PATCH', data: passwords }).then(() => {
      this.toast.success('Password has been changed.');
      this.transitionToRoute('me.homepage');
    }).catch((response) => { this.house.handleErrorResponse(response) })
    .finally(() => this.isSubmitting = false);
  }

  @action
  cancelAction() {
    this.transitionToRoute('me.homepage');
  }
}
