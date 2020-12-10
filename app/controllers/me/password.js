import Controller from '@ember/controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence, validateLength, validateConfirmation} from 'ember-changeset-validations/validators';

export default class MePasswordController extends Controller {
  queryParams = ['token'];

  @tracked isSubmitting = false;

  get passwordValidations() {
    const validations = {
      password: [
        validatePresence({presence: true, message: 'Enter the new password.'}),
        validateLength({min: 5, message: 'The password should be 5 characters or more.'})
      ],
      password_confirmation: [
        validateConfirmation({on: 'password', message: 'The password do not match.'})
      ]
    };

    if (!this.token) {
      // Only ask for an old password if no reset password token was given.
      validations.password_old = [
        validatePresence({presence: true, message: 'Enter your old password.'}),
      ];
    }

    return validations;
  }

  @action
  submitAction(model, isValid) { // eslint-disable-line no-unused-vars
    if (!isValid) {
      return;
    }

    const person = this.person;
    const passwords = {
      password: model.password,
      password_confirmation: model.password_confirmation
    };

    if (this.token) {
      passwords.reset_token = this.token;
    } else {
      passwords.password_old = model.password_old;
    }

    this.isSubmitting = true;
    return this.ajax.request(`person/${person.id}/password`, {method: 'PATCH', data: passwords}).then(() => {
      this.toast.success('Password has been successfully changed.');
      this.transitionToRoute('me.homepage');
    }).catch((response) => {
      this.house.handleErrorResponse(response)
    })
      .finally(() => this.isSubmitting = false);
  }

  @action
  cancelAction() {
    this.transitionToRoute('me.homepage');
  }
}
