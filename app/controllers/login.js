import Controller from '@ember/controller';
import LoginValidations from 'clubhouse/validations/login';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  loginValidations = LoginValidations;
  isSubmitting = false;
  loginError = null;

  /*
   * Obtain an authorization token from the API server (aka login)
   */

  apiLogin(credentials, model) {
    this.set('isSubmitting', true);
    return this.session.authenticate('authenticator:jwt', credentials)
      .catch((response) => {
        if (response.status == 401) {
          const data = response.json ? response.json : response.payload;
          this.set('loginError', (data ? data.status : `Unknown error ${JSON.stringify(data)}`));
          model.set('password', '');
        } else {
          this.house.handleErrorResponse(response)
        }
      }).finally(() => {
        this.set('isSubmitting', false);
        this.house.scrollToTop();
      });
  }

  @action
  submit(model, isValid) {
    if (!isValid)
      return;

    this.set('loginError', null);
    this.toast.clear();
    let credentials = model.getProperties('identification', 'password');

    // For analytics
    credentials.screen_size = {
      width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };

    this.apiLogin(credentials, model);
  }
}
