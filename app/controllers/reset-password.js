import Controller from '@ember/controller';
import EmberObject, {action} from '@ember/object';
import ResetPasswordValidations from '../validations/reset-password';
import {tracked} from '@glimmer/tracking';

export default class ResetPasswordController extends Controller {
  @tracked isSubmitting = false;
  @tracked authForm = {};

  resetPasswordValidations = ResetPasswordValidations;


  @action
  submit(model, isValid) {
    if (!isValid)
      return;

    const {identification} = model;

    this.tokenError = null;
    this.isSubmitting = true;
    return this.ajax.request('/auth/reset-password', {
      method: 'POST',
      data: {identification}
    }).then(() => {
      this.modal.info('Reset password instructions sent.',
        `Instructions to reset your password will be sent to you shortly. Please check your email '${identification}'.`);
      this.transitionToRoute('login');
    }).catch((response) => {
      switch (response.status) {
        case 400:
          this.modal.info(null, 'Sorry, no account was found with the email address entered.');
          break;

        case 403:
          this.modal.info(null, 'Sorry, this account has been temporarily disabled. Please contact the Ranger Personnel Manager.');
          break;

        default:
          this.house.handleErrorResponse(response)
          break;
      }
    }).finally(() => this.isSubmitting = false);
  }
}
