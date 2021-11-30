import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {
  validatePresence,
  validateLength,
  validateConfirmation
} from 'ember-changeset-validations/validators';

export default class PersonPasswordController extends ClubhouseController {
  @tracked isSubmitting = false;

  passwordValidations = {
    password: [
      validatePresence({presence: true, message: 'Enter the new password.'}),
      validateLength({min: 5, message: 'The password should be 5 characters or more.'})
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

    const person = this.person;

    const passwords = {
      password: model.password,
      password_confirmation: model.password_confirmation
    };

    this.isSubmitting = true;
    return this.ajax.request(`person/${person.id}/password`, {method: 'PATCH', data: passwords})
      .then(() => {
        this.toast.success('Password has been changed.');
        this.router.transitionTo('person.index', person.id);
      }).catch((response) => {
        this.house.handleErrorResponse(response)
      })
      .finally(() => this.isSubmitting = false);
  }
}
