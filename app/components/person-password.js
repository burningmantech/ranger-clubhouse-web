import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service } from '@ember/service';

import {
  validatePresence,
  validateLength,
  validateConfirmation
} from 'ember-changeset-validations/validators';

export default class PersonPasswordComponent extends Component {
  @tracked isSubmitting = false;

  @service ajax;
  @service house;
  @service toast;

  @tracked passwordForm = {password: '', password_confirmation: ''};

  passwordValidations = {
    password: [
      validatePresence({presence: true, message: 'Enter the new password.'}),
      validateLength({min: 5, message: 'The password should be 5 characters or more.'}),
      validateLength({max: 30, message: 'The password may only be 30 characters or less.'})
    ],
    password_confirmation: [
      validateConfirmation({on: 'password', message: 'The password do not match.'})
    ],
  };

  @action
  submitAction(model, isValid) { // eslint-disable-line no-unused-vars
    if (!isValid) {
      return;
    }

    const {person} = this.args;
    const passwords = {
      password: model.password,
      password_confirmation: model.password_confirmation
    };

    this.isSubmitting = true;
    return this.ajax.request(`person/${person.id}/password`, {method: 'PATCH', data: passwords})
      .then(() => {
        this.toast.success('Password has been changed.');
        this.args.onClose();
      }).catch((response) => {
        this.house.handleErrorResponse(response)
      })
      .finally(() => this.isSubmitting = false);
  }
}
