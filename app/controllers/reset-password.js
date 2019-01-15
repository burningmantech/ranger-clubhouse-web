import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import ResetPasswordValidations from '../validations/reset-password';

export default class ResetPasswordController extends Controller {
  resetPasswordValidations = ResetPasswordValidations;

  @action
  submit(model, isValid) {
    if (!isValid)
      return;

    let identification = model.get('identification');

    return this.ajax.request('/auth/reset-password', {
      method: 'POST',
      data: {
        identification
      }
    }).then(() => {
      this.modal.info('Reset password instructions sent.',
        `Instructions to reset your password will be sent to you shortly. Please check your email '${identification}'.`);
      this.transitionToRoute('login');
    }).catch((response) => {
      switch (response.status) {
      case 400:
        this.toast.error('Sorry, the email address could not be found.');
        break;

      case 403:
        this.toast.error('Sorry, this account has been temporarily disabled. Please contact the Ranger Personnel Manager.');
        break;

      default:
        this.house.handleErrorResponse(response)
        break;
      }
    });
  }
}
