import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { action } from '@ember-decorators/object';
import {
  validatePresence,
  validateLength,
  validateConfirmation
} from 'ember-changeset-validations/validators';

export default class PersonPasswordController extends Controller {
  passwordValidations = {
    password: [
      validatePresence({ presence: true, message: 'Enter the new password.' }),
      validateLength({ min: 5, message: 'The password should be 5 characters or more.' })
    ],
    password_confirmation: [
      validateConfirmation({ on: 'password', message: 'The password do not match.' })
    ],
  };

  passwordForm = EmberObject.create({
    password: '',
    password_confirmation: ''
  });


  @action
  submitAction(model, isValid) { // eslint-disable-line no-unused-vars
    if (!isValid) {
      return;
    }

    const person = this.person;

    let passwords = model.getProperties('password', 'password_confirmation');

    return person.changePassword(passwords).then(() => {
      this.toast.success('Password has been changed.');
      this.transitionToRoute('person.index', person.id);
    }).catch((response) => { this.house.handleErrorResponse(response) })
  }
}
