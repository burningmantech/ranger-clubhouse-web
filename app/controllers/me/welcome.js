import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {validatePresence, validateLength, validateConfirmation} from 'ember-changeset-validations/validators';

/*
   Welcome page for PNVs. The user is forced to set a password. After the password is set, a modal dialog tells

 */
export default class MeWelcomeController extends ClubhouseController {
  @tracked isSubmitting = false;
  @tracked showSuccessDialog = false;

  passwordValidations = {
    password: [
      validatePresence({presence: true, message: 'Enter the new password.'}),
      validateLength({min: 5, message: 'The password should be 5 characters or more.'})
    ],
    password_confirmation: [
      validateConfirmation({on: 'password', message: 'The password do not match.'})
    ]
  };

  @action
  submitAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const passwords = {
      password: model.password,
      password_confirmation: model.password_confirmation,
      temp_token: this.session.tempLoginToken
    };

    this.isSubmitting = true;
    return this.ajax.request(`person/${this.session.userId}/password`, {method: 'PATCH', data: passwords})
      .then(() => {
        this.session.tempLoginToken = null;
        this.session.isWelcome = false;
        this.showSuccessDialog = true;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isSubmitting = false);
  }

  @action
  closeAction() {
    this.transitionToRoute('me.homepage');
  }
}
