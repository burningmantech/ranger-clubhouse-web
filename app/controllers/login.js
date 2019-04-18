import Controller from '@ember/controller';
import LoginValidations from 'clubhouse/validations/login';
import ENV from 'clubhouse/config/environment';
import { action } from '@ember-decorators/object';
import setCookie from 'clubhouse/utils/set-cookie';

export default class LoginController extends Controller {
  loginValidations = LoginValidations;
  isSubmitting = false;
  loginError = null;

  /*
   * Obtain an authorization token from the API server (aka login)
   */

  apiLogin(credentials) {
    this.set('isSubmitting', true);
    return this.session.authenticate('authenticator:jwt', credentials)
      .then(() => {
      /*
         Uncomment if using session cookies to bounce between sites.

        if (ENV['dualClubhouse']) {
          this.classicLogin(credentials);
        }
        */
        setCookie('C2AUTHTOKEN', this.session.data.authenticated.token);
      })
      .catch((response) => {
        if (response.status == 401) {
          const data = response.json ? response.json : response.payload;
          this.set('loginError', (data ? data.status : `Unknown error ${JSON.stringify(data)}`));
        } else {
          this.house.handleErrorResponse(response)
        }
      }).finally(() => {
        this.set('isSubmitting', false);
        this.house.scrollToTop();
      });
  }

  /*
   * Login to Classic Clubhouse and obtain a session cookie
   */

  async classicLogin(credentials) {
    // Invalidate the existing Classic clubhouse cookie
    setCookie('PHPSESSID', 'nothing', 0);
    await this.ajax.post('/?DMSc=security&DMSm=login&json=1', {
        headers: {
          // Avoid CORS pre-flight
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        host: ENV['clubhouseClassicUrl'],
        data: {
          email: credentials.identification,
          password: credentials.password
        },
      }).then((result) => {
        // So far, so good. set the clubhouse classic PHP session cookie,
        // and then try for Clubhouse 2.0 authentication.
        const session = result.session;
        setCookie(session.name, session.id);
        this.session.set('classicSession', session);
      })
      .catch((response) => {
        this.house.handleErrorResponse(response);
        this.toast.error('There was a problem logging into the Classic Clubhouse. Some features may not be available.');
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

    this.apiLogin(credentials);
  }
}
