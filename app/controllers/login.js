import Controller from '@ember/controller';
import LoginValidations from 'clubhouse/validations/login';
import ENV from 'clubhouse/config/environment';
import { action } from '@ember-decorators/object';

export default class LoginController extends Controller {
  loginValidations = LoginValidations;
  isSubmitting = false;
  loginError = null;

  apiLogin(credentials) {
    this.set('isSubmitting', true);
    return this.session.authenticate('authenticator:jwt', credentials)
      .then(() => {
        if (ENV['dualClubhouse']) {
          this.classicLogin(credentials);
        }
      })
      .catch((response) => {
        if (response.status == 401) {
          const data = response.json ? response.json : response.payload;
          this.set('loginError', data.status);
        } else {
          this.house.handleErrorResponse(response)
        }
      }).finally(() => this.set('isSubmitting', false));
  }

  async classicLogin(credentials) {
    //
    // Attempt to authorize with Classic Clubhouse before trying for
    // Clubhouse 2.0
    //

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
      }).then((response) => {
        // So far, so good. set the clubhouse classic PHP session cookie,
        // and then try for Clubhouse 2.0 authentication.
        const session = response.session;
        this.setCookie(session.name, session.id);
      })
      .catch((response) => {
        this.house.handleErrorResponse(response);
        this.toast.error('There was a problem logging into the Classic Clubhouse. Some features may not be available.');
      });
  }

  setCookie(name, value, days) {
    let expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
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
